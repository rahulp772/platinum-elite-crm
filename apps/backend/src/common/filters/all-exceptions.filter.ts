import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ErrorResponse } from '../interfaces/error-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof QueryFailedError) {
      this.handleDatabaseError(exception, request);
      message = 'Database operation failed';
      error = 'Database Error';
    } else if (exception instanceof Error) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${exception.message}`,
        exception.stack,
      );

      if (exception.name === 'ValidationError') {
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
        error = 'Validation Error';
      } else if (exception.name === 'UnauthorizedError') {
        status = HttpStatus.UNAUTHORIZED;
        message = 'Unauthorized';
        error = 'Unauthorized';
      }
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      const errorWithStack = exception as Error & { stack?: string };
      (errorResponse as unknown as { stack: string }).stack =
        errorWithStack.stack || '';
    }

    response.status(status).json(errorResponse);
  }

  private handleDatabaseError(error: QueryFailedError, request: Request): void {
    this.logger.error(
      `[${request.method}] ${request.url} - Database error: ${error.message}`,
      error.stack,
    );

    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('unique constraint')) {
      throw new HttpException(
        { message: 'Resource already exists', error: 'Conflict' },
        HttpStatus.CONFLICT,
      );
    }

    if (errorMessage.includes('foreign key')) {
      throw new HttpException(
        { message: 'Referenced resource not found', error: 'Bad Request' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (errorMessage.includes('not null')) {
      throw new HttpException(
        { message: 'Required field is missing', error: 'Bad Request' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
