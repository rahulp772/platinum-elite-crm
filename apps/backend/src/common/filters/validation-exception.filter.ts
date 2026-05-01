import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError } from '../interfaces/error-response.interface';

interface ValidationExceptionResponse {
  message: string | string[];
  error: string;
  statusCode: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

@Catch(HttpException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse =
      exception.getResponse() as ValidationExceptionResponse;

    if (status !== 400 || !exceptionResponse) {
      throw exception;
    }

    const validationErrors: ValidationError[] =
      this.extractValidationErrors(exceptionResponse);

    const errorResponse = {
      statusCode: HttpStatus.BAD_REQUEST,
      message: Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message[0]
        : exceptionResponse.message,
      error: 'Validation Error',
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      validationErrors,
    };

    this.logger.warn(
      `[${request.method}] ${request.url} - Validation failed: ${validationErrors.length} errors`,
    );

    response.status(HttpStatus.BAD_REQUEST).json(errorResponse);
  }

  private extractValidationErrors(
    response: ValidationExceptionResponse,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (Array.isArray(response.message)) {
      for (const msg of response.message) {
        if (typeof msg === 'string') {
          const parsed = this.parseValidationMessage(msg);
          if (parsed) {
            errors.push(parsed);
          }
        }
      }
    }

    if (response.errors && Array.isArray(response.errors)) {
      for (const err of response.errors) {
        errors.push({
          field: err.field,
          message: err.message,
        });
      }
    }

    return errors;
  }

  private parseValidationMessage(msg: string): ValidationError | null {
    const match = msg.match(/^(\w+)\s*:\s*(.+)$/);
    if (match) {
      return {
        field: match[1],
        message: match[2],
      };
    }
    return null;
  }
}
