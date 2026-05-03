import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  SendMessageDto,
  CreateConversationDto,
  GetMessagesQueryDto,
} from './dto/chat.dto';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  private s3Client: S3Client;

  constructor(private readonly chatService: ChatService) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for the current user' })
  getConversations(@Request() req) {
    return this.chatService.getConversations(req.user);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: GetMessagesQueryDto,
    @Request() req,
  ) {
    return this.chatService.getMessages(id, req.user, query.page, query.limit);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message in a conversation' })
  sendMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
    @Request() req,
  ) {
    return this.chatService.sendMessage(
      id,
      dto.content,
      req.user,
      dto.attachments,
    );
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file for a message' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new Error('Only images and PDF files are allowed'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('conversationId') conversationId: string,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded. This might happen if the file type is not allowed or if the form data was incorrectly formatted.');
    }

    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    const filename = `${randomName}${extname(file.originalname)}`;
    const bucketName = process.env.AWS_S3_BUCKET_NAME || 'my-crm-bucket';
    const tenantId = req.user?.tenantId || 'default-tenant';
    
    // Structure: chat/:tenantid/:chatid/:filename
    const folder = conversationId ? `chat/${tenantId}/${conversationId}` : `chat/${tenantId}/general`;
    const objectKey = `${folder}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Removed ACL: 'public-read' to avoid AccessDenied on buckets with Object Ownership set to Bucket Owner Enforced
    });

    try {
      await this.s3Client.send(command);
      
      const region = process.env.AWS_REGION || 'us-east-1';
      const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`;

      return {
        url: fileUrl,
        name: file.originalname,
        size: file.size,
        type: file.mimetype.includes('pdf') ? 'pdf' : 'image',
      };
    } catch (error: any) {
      console.error('S3 Upload Error:', error);
      throw new InternalServerErrorException(
        `Failed to upload file to S3: ${error.message}`
      );
    }
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  createConversation(@Body() dto: CreateConversationDto, @Request() req) {
    return this.chatService.createConversation(dto.participantIds, req.user);
  }
}
