import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
    const userTenantId = user.tenantId;

    let userFilter: any = {};
    if (!user.isSuperAdmin) {
      userFilter = { tenantId: userTenantId };
    }

    const allUsers = await this.userRepository.find({
      where: { ...userFilter, id: Not(userId) },
    });

    let convFilter: any = {};
    if (!user.isSuperAdmin) {
      convFilter = { tenantId: userTenantId };
    }

    const userConversations = await this.conversationRepository.find({
      where: convFilter,
      relations: ['participants'],
    });

    const userConversationsWithCurrentUser = userConversations.filter((conv) =>
      conv.participants.some((p) => p.id === userId),
    );

    const results: ConversationWithDetails[] = [];

    for (const u of allUsers) {
      const existingConv = userConversationsWithCurrentUser.find((conv) =>
        conv.participants.some((p) => p.id === u.id),
      );

      if (existingConv) {
        const messages = await this.messageRepository.find({
          where: { conversationId: existingConv.id },
          order: { timestamp: 'DESC' },
          take: 1,
        });

        const lastMessage = messages[0]
          ? {
              id: messages[0].id,
              content: messages[0].content,
              senderId: messages[0].senderId,
              timestamp: messages[0].timestamp,
              read: messages[0].read,
              attachments: messages[0].attachments,
            }
          : undefined;

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

  async getMessages(
    conversationId: string,
    user: User,
    page: number = 1,
    limit: number = 50,
  ): Promise<PaginatedMessages> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (p) => p.id === user.id,
    );
    if (!isParticipant && !user.isSuperAdmin) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    const userId = user.id;
    const conversationTenantId = conversation.tenantId;
    const userTenantId = user.isSuperAdmin ? null : user.tenantId;

    let query = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.conversationId = :conversationId', { conversationId });

    if (!user.isSuperAdmin) {
      if (conversationTenantId) {
        query = query.andWhere(
          '(message.tenantId = :tenantId OR message.tenantId IS NULL)',
          { tenantId: conversationTenantId },
        );
      } else {
        query = query.andWhere('message.tenantId IS NULL');
      }
    }

    const total = await query.getCount();

    const messages = await query
      .orderBy('message.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      messages: messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        sender: msg.sender
          ? {
              id: msg.sender.id,
              name: msg.sender.name,
              avatar: (msg.sender as any).avatar,
            }
          : undefined,
        conversationId: conversationId,
        timestamp: msg.timestamp,
        read: msg.read,
        attachments: msg.attachments,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async sendMessage(
    conversationId: string,
    content: string | undefined,
    sender: User,
    attachments?: any[],
  ) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID ${conversationId} not found`,
      );
    }

    const isParticipant = conversation.participants.some(
      (p) => p.id === sender.id,
    );
    if (!isParticipant && !sender.isSuperAdmin) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    const messageTenantId = conversation.tenantId;

    const message = this.messageRepository.create({
      content: content || '',
      senderId: sender.id,
      sender: sender,
      conversationId: conversationId,
      tenantId: messageTenantId,
      attachments: attachments,
    });

    await this.conversationRepository.update(conversationId, {
      updatedAt: new Date(),
    });

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
      attachments: savedMessage.attachments,
      participants: conversation.participants.map((p) => ({
        id: p.id,
        name: p.name,
      })),
    };
  }

  async createConversation(participantIds: string[], user: User) {
    const userId = user.id;
    const userTenantId = user.tenantId;
    const allParticipantIds = [userId, ...participantIds];

    if (userTenantId) {
      const existingConversation = await this.conversationRepository
        .createQueryBuilder('conv')
        .innerJoin(
          'conv.participants',
          'participant',
          'participant.id IN (:...participantIds)',
          {
            participantIds: allParticipantIds,
          },
        )
        .where('conv.tenantId = :tenantId', { tenantId: userTenantId })
        .groupBy('conv.id')
        .having('COUNT(participant.id) = :count', {
          count: allParticipantIds.length,
        })
        .getOne();

      if (existingConversation) {
        return this.getConversationWithParticipants(existingConversation.id);
      }
    } else {
      const existingConversation = await this.conversationRepository
        .createQueryBuilder('conv')
        .innerJoin(
          'conv.participants',
          'participant',
          'participant.id IN (:...participantIds)',
          {
            participantIds: allParticipantIds,
          },
        )
        .where('conv.tenantId IS NULL')
        .groupBy('conv.id')
        .having('COUNT(participant.id) = :count', {
          count: allParticipantIds.length,
        })
        .getOne();

      if (existingConversation) {
        return this.getConversationWithParticipants(existingConversation.id);
      }
    }

    const participants = await this.userRepository.findByIds([
      userId,
      ...participantIds,
    ]);

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

    const lastMessage = messages[0]
      ? {
          id: messages[0].id,
          content: messages[0].content,
          senderId: messages[0].senderId,
          timestamp: messages[0].timestamp,
          read: messages[0].read,
          attachments: messages[0].attachments,
        }
      : undefined;

    return {
      id: conversation.id,
      participants: conversation.participants.map((p) => ({
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
