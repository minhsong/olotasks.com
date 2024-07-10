import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as MongoDB from 'winston-mongodb';
const { combine, timestamp, printf } = winston.format;

@Injectable()
export class LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new MongoDB.MongoDB({
          level: 'error',
          format: combine(
            winston.format.errors({ stack: true }), // log the full stack
            printf(({ level, message, timestamp, stack }) => {
              // formating the log outcome to show/store
              return `${timestamp} ${level}: ${message} - ${stack}`;
            }),
            winston.format.metadata(), // >>>> ADD THIS LINE TO STORE the ERR OBJECT IN META field
          ),
          db: process.env.LOGGER_MONGODB_CONNECTION_URL, // Replace with your MongoDB connection string
          options: { useUnifiedTopology: true },
          collection: 'logs',
        }),
        new MongoDB.MongoDB({
          level: 'info',
          format: combine(
            winston.format.metadata(), // >>>> ADD THIS LINE TO STORE the ERR OBJECT IN META field
          ),
          db: process.env.LOGGER_MONGODB_CONNECTION_URL, // Replace with your MongoDB connection string
          options: { useUnifiedTopology: true },
          collection: 'logs_info',
        }),
      ],
    });
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}
