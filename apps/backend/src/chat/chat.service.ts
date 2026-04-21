import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';

export interface ConversationWithDetails {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedMessages {
  messages: Message[];
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
    let whereCondition: any = {
      participants: { id: user.id },
    };
    
    if (user.isSuperAdmin) {
      // Super admin sees all conversations
    } else if (user.tenantId) {
      whereCondition.tenantId = user.tenantId;
    } else {
      whereCondition.tenantId = IsNull();
    }

    const conversations = await this.conversationRepository.find({
      where: whereCondition,
      relations: ['participants', 'messages', 'messages.sender'],
      order: { updatedAt: 'DESC' },
    });

    return conversations.map((conv) => {
      const otherMessages = conv.messages || [];
      const lastMessage =
        otherMessages.length > 0
          ? otherMessages.sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime(),
            )[0]
          : undefined;

      const unreadCount = otherMessages.filter(
        (msg) => !msg.read && msg.sender?.id !== user.id,
      ).length;

      return {
        id: conv.id,
        participants: conv.participants,
        lastMessage,
        unreadCount,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    });
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

    let whereCondition: any = { conversation: { id: conversationId } };
    
    if (!user.isSuperAdmin) {
      if (user.tenantId) {
        whereCondition.tenantId = user.tenantId;
      } else {
        whereCondition.tenantId = IsNull();
      }
    }

    const [messages, total] = await this.messageRepository.findAndCount({
      where: whereCondition,
      relations: ['sender'],
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      messages: messages.reverse(),
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
      sender,
      senderId: sender.id,
      conversation,
      tenantId: sender.tenantId,
    });

    await this.conversationRepository.update(conversationId, { updatedAt: new Date() });
    
    return this.messageRepository.save(message);
  }

  async createConversation(participantIds: string[], user: User) {
    const tenantId = user.isSuperAdmin ? undefined : user.tenantId;
    
    if (tenantId) {
      const existingConversation = await this.conversationRepository
        .createQueryBuilder('conv')
        .innerJoin('conv.participants', 'participant')
        .where('conv.tenantId = :tenantId', { tenantId })
        .andWhere('participant.id IN (:...participantIds)', {
          participantIds: [user.id, ...participantIds],
        })
        .groupBy('conv.id')
        .having('COUNT(participant.id) = :count', { count: participantIds.length + 1 })
        .getOne();

      if (existingConversation) {
        return existingConversation;
      }
    } else if (!user.isSuperAdmin && !user.tenantId) {
      const existingConversation = await this.conversationRepository
        .createQueryBuilder('conv')
        .innerJoin('conv.participants', 'participant')
        .where('conv.tenantId IS NULL')
        .andWhere('participant.id IN (:...participantIds)', {
          participantIds: [user.id, ...participantIds],
        })
        .groupBy('conv.id')
        .having('COUNT(participant.id) = :count', { count: participantIds.length + 1 })
        .getOne();

      if (existingConversation) {
        return existingConversation;
      }
    }

    const participantWhere: any = { id: user.id };
    if (user.tenantId) {
      participantWhere.tenantId = user.tenantId;
    } else if (!user.isSuperAdmin) {
      participantWhere.tenantId = IsNull();
    }
    
    const participants = await this.userRepository.find({
      where: participantWhere,
    });
    
    const otherParticipants = await this.userRepository.findByIds(participantIds);
    participants.push(...otherParticipants);

    const conversation = this.conversationRepository.create({
      participants,
      tenantId: user.tenantId,
    });
    return this.conversationRepository.save(conversation);
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    await this.messageRepository.update(
      {
        conversation: { id: conversationId },
        sender: { id: Not(userId) },
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
