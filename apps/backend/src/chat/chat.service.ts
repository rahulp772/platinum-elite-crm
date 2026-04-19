import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
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
    const conversations = await this.conversationRepository.find({
      where: {
        participants: { id: user.id },
      },
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

  async getMessages(conversationId: string) {
    return this.messageRepository.find({
      where: { conversation: { id: conversationId } },
      relations: ['sender'],
      order: { timestamp: 'ASC' },
    });
  }

  async sendMessage(conversationId: string, content: string, sender: User) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID ${conversationId} not found`,
      );
    }

    const message = this.messageRepository.create({
      content,
      sender,
      conversation,
    });

    return this.messageRepository.save(message);
  }

  async createConversation(participantIds: string[]) {
    const participants = await this.userRepository.findByIds(participantIds);
    const conversation = this.conversationRepository.create({
      participants,
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
