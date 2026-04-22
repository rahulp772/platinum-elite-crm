import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';

export interface ConversationWithDetails {
  id: string;
  participants: User[];
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    timestamp: Date;
    read: boolean;
  };
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedMessages {
  messages: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getConversations(user: User): Promise<ConversationWithDetails[]> {
    const userId = user.id;
    const tenantId = user.isSuperAdmin ? null : user.tenantId;

    const allUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id != :userId', { userId })
      .andWhere(tenantId ? 'user.tenantId = :tenantId' : 'user.tenantId IS NULL', { tenantId: tenantId || undefined })
      .getMany();

    const userConversations = await this.conversationRepository
      .createQueryBuilder('conv')
      .innerJoin('conv.participants', 'participant', 'participant.id = :userId', { userId })
      .leftJoinAndSelect('conv.participants', 'allParticipants')
      .where(tenantId ? 'conv.tenantId = :tenantId' : 'conv.tenantId IS NULL', { tenantId: tenantId || undefined })
      .orderBy('conv.updatedAt', 'DESC')
      .getMany();

    const convMap = new Map(userConversations.map(c => [c.id, c]));

    const results: ConversationWithDetails[] = [];
    
    for (const u of allUsers) {
      const existingConv = userConversations.find(conv => 
        conv.participants.some(p => p.id === u.id)
      );

      if (existingConv) {
        const messages = await this.messageRepository.find({
          where: { conversationId: existingConv.id },
          order: { timestamp: 'DESC' },
          take: 1,
        });

        const lastMessage = messages[0] ? {
          id: messages[0].id,
          content: messages[0].content,
          senderId: messages[0].senderId,
          timestamp: messages[0].timestamp,
          read: messages[0].read,
        } : undefined;

        const unreadCount = await this.messageRepository.count({
          where: {
            conversationId: existingConv.id,
            senderId: Not(userId),
            read: false,
          },
        });

        results.push({
          id: existingConv.id,
          participants: existingConv.participants,
          lastMessage,
          unreadCount,
          createdAt: existingConv.createdAt,
          updatedAt: existingConv.updatedAt,
        });
      } else {
        results.push({
          id: `new_${u.id}`,
          participants: [u],
          lastMessage: undefined,
          unreadCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    results.sort((a, b) => {
      if (a.id.startsWith('new_') && !b.id.startsWith('new_')) return 1;
      if (!a.id.startsWith('new_') && b.id.startsWith('new_')) return -1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return results;
  }

  async getMessages(conversationId: string, user: User, page: number = 1, limit: number = 50): Promise<PaginatedMessages> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some(p => p.id === user.id);
    if (!isParticipant && !user.isSuperAdmin) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const userId = user.id;
    const tenantId = user.isSuperAdmin ? null : user.tenantId;

    let query = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.conversationId = :conversationId', { conversationId });

    if (!user.isSuperAdmin) {
      if (tenantId) {
        query = query.andWhere('message.tenantId = :tenantId', { tenantId });
      } else {
        query = query.andWhere('message.tenantId IS NULL');
      }
    }

    const total = await query.getCount();

    const messages = await query
      .orderBy('message.timestamp', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      messages: messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        sender: msg.sender ? {
          id: msg.sender.id,
          name: msg.sender.name,
          avatar: (msg.sender as any).avatar,
        } : undefined,
        conversationId: conversationId,
        timestamp: msg.timestamp,
        read: msg.read,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async sendMessage(conversationId: string, content: string, sender: User) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    const isParticipant = conversation.participants.some(p => p.id === sender.id);
    if (!isParticipant && !sender.isSuperAdmin) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const message = this.messageRepository.create({
      content,
      senderId: sender.id,
      sender: sender,
      conversationId: conversationId,
      tenantId: sender.tenantId,
    });

    await this.conversationRepository.update(conversationId, { updatedAt: new Date() });
    
    const savedMessage = await this.messageRepository.save(message);
    
    return {
      id: savedMessage.id,
      content: savedMessage.content,
      senderId: savedMessage.senderId,
      sender: {
        id: sender.id,
        name: sender.name,
        avatar: (sender as any).avatar,
      },
      conversationId: conversationId,
      timestamp: savedMessage.timestamp,
      read: savedMessage.read,
      participants: conversation.participants.map(p => ({
        id: p.id,
        name: p.name,
      })),
    };
  }

  async createConversation(participantIds: string[], user: User) {
    const userId = user.id;
    const tenantId = user.isSuperAdmin ? null : user.tenantId;
    const allParticipantIds = [userId, ...participantIds];

    if (tenantId) {
      const existingConversation = await this.conversationRepository
        .createQueryBuilder('conv')
        .innerJoin('conv.participants', 'participant', 'participant.id IN (:...participantIds)', { 
          participantIds: allParticipantIds 
        })
        .where('conv.tenantId = :tenantId', { tenantId })
        .groupBy('conv.id')
        .having('COUNT(participant.id) = :count', { count: allParticipantIds.length })
        .getOne();

      if (existingConversation) {
        return this.getConversationWithParticipants(existingConversation.id);
      }
    } else if (!user.isSuperAdmin) {
      const existingConversation = await this.conversationRepository
        .createQueryBuilder('conv')
        .innerJoin('conv.participants', 'participant', 'participant.id IN (:...participantIds)', { 
          participantIds: allParticipantIds 
        })
        .where('conv.tenantId IS NULL')
        .groupBy('conv.id')
        .having('COUNT(participant.id) = :count', { count: allParticipantIds.length })
        .getOne();

      if (existingConversation) {
        return this.getConversationWithParticipants(existingConversation.id);
      }
    }

    const participants = await this.userRepository.findByIds([userId, ...participantIds]);

    if (participants.length !== allParticipantIds.length) {
      throw new NotFoundException('One or more participants not found');
    }

    const conversation = this.conversationRepository.create({
      participants,
      tenantId: user.tenantId,
    });
    
    const saved = await this.conversationRepository.save(conversation);
    return this.getConversationWithParticipants(saved.id);
  }

  private async getConversationWithParticipants(conversationId: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const messages = await this.messageRepository.find({
      where: { conversationId },
      order: { timestamp: 'DESC' },
      take: 1,
    });

    const lastMessage = messages[0] ? {
      id: messages[0].id,
      content: messages[0].content,
      senderId: messages[0].senderId,
      timestamp: messages[0].timestamp,
      read: messages[0].read,
    } : undefined;

    return {
      id: conversation.id,
      participants: conversation.participants.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        avatar: (p as any).avatar,
      })),
      lastMessage,
      unreadCount: 0,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    await this.messageRepository.update(
      {
        conversationId: conversationId,
        senderId: Not(userId),
        read: false,
      },
      { read: true },
    );
  }

  async getConversation(conversationId: string) {
    return this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });
  }
}
