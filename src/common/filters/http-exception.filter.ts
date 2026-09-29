import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    // Format Mongoose / MongoDB errors nicely
    if (!(exception instanceof HttpException) && exception && typeof exception === 'object') {
      const err = exception as any;
      if (err.name === 'ValidationError') {
        status = HttpStatus.BAD_REQUEST;
        const details = err.errors
          ? Object.values(err.errors).map((e: any) => e.message).join(', ')
          : err.message;
        message = { statusCode: 400, message: details || 'Validation failed', error: 'Bad Request' };
      } else if (err.code === 11000) {
        status = HttpStatus.CONFLICT;
        message = { statusCode: 409, message: 'Duplicate record already exists', error: 'Conflict' };
      } else if (err.name === 'CastError') {
        status = HttpStatus.BAD_REQUEST;
        message = { statusCode: 400, message: `Invalid ID or format for ${err.path}`, error: 'Bad Request' };
      }
    }

    const body =
      typeof message === 'string'
        ? { statusCode: status, message, path: request.url }
        : { statusCode: status, ...(message as object), path: request.url };

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url}`, exception instanceof Error ? exception.stack : '');
    }

    response.status(status).json(body);
  }
}
