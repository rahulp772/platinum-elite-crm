import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private bucket: string;
  private region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION', 'ap-south-1');
    this.bucket = this.configService.get<string>(
      'AWS_S3_BUCKET',
      'makeitcrm-298030125692-ap-south-1-an',
    );

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
          '',
        ),
      },
    });
  }

  async saveFile(
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string }> {
    const fileId = uuidv4();
    const extension = file.originalname.split('.').pop() || 'xlsx';
    const key = `temp/imports/${fileId}.${extension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const url = await this.getSignedUrl(key);
      this.logger.log(`File uploaded to S3: ${key}`);

      return { key, url };
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${error.message}`);
      throw error;
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return url;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${error.message}`);
      throw error;
    }
  }

  async readFile(key: string): Promise<unknown[][]> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('S3 response body is empty');
      }

      const chunks: Buffer[] = [];
      const body = response.Body as any;
      
      if (body.pipe) {
        // Node.js stream
        return new Promise((resolve, reject) => {
          const chunks: Buffer[] = [];
          body.on('data', (chunk: Buffer) => chunks.push(chunk));
          body.on('end', () => {
            try {
              resolve(this.parseXlsxToArray(Buffer.concat(chunks)));
            } catch (e) {
              reject(e);
            }
          });
          body.on('error', reject);
        });
      } else {
        // Async iterable
        for await (const chunk of body as AsyncIterable<Uint8Array>) {
          chunks.push(Buffer.from(chunk));
        }
        return this.parseXlsxToArray(Buffer.concat(chunks));
      }
    } catch (error) {
      this.logger.error(`Failed to read file from S3: ${error}`);
      throw error;
    }
  }

  private parseXlsxToArray(buffer: Buffer): unknown[][] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    return data as unknown[][];
  }

  async readFileAsBuffer(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const chunks: Buffer[] = [];

      if (response.Body) {
        const body = response.Body as any;
        for await (const chunk of body) {
          chunks.push(Buffer.from(chunk));
        }
      }

      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(`Failed to read file buffer from S3: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted from S3: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${error.message}`);
      throw error;
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}
