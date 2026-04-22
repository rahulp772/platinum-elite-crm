import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

interface JwtPayload {
  sub: string;
  email: string;
  tenantId?: string;
  isSuperAdmin?: boolean;
  roleId?: string;
  role?: {
    id: string;
    name: string;
    level: number;
    permissions: string[];
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map();

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token);
      
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['role', 'tenant'],
      });

      if (!user) {
        client.disconnect();
        return;
      }

      client.data.user = user;
      this.userSockets.set(user.id, client.id);

      client.join(`user:${user.id}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.user) {
      this.userSockets.delete(client.data.user.id);
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(`conversation:${data.conversationId}`);
    return { event: 'joined', data: { conversationId: data.conversationId } };
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conversation:${data.conversationId}`);
    return { event: 'left', data: { conversationId: data.conversationId } };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const user = client.data.user as User;
    if (!user) return;

    try {
      const message = await this.chatService.sendMessage(
        data.conversationId,
        data.content,
        user,
      );

      // Emit to the conversation room for active chat windows
      this.server
        .to(`conversation:${data.conversationId}`)
        .emit('new_message', message);
      
      // Also emit to each participant's individual room for global notifications
      if (message.participants) {
        message.participants.forEach((participant: any) => {
          this.server.to(`user:${participant.id}`).emit('new_message', message);
        });
      }
      
      return message;
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const user = client.data.user as User;
    if (!user) return;

    try {
      await this.chatService.markMessagesAsRead(data.conversationId, user.id);
      this.server
        .to(`conversation:${data.conversationId}`)
        .emit('messages_read', {
          conversationId: data.conversationId,
          userId: user.id,
        });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  sendMessageToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}
