import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from './winston/winston.module';
import { LoggerModule } from './app/modules/logger.module';
import { LoggingMiddleware } from './middlewares/logging.middleware';
import { BoardModule } from './app/modules/board.module';
import { CardModule } from './app/modules/card.module';
import { UserModule } from './app/modules/user.module';
import { ListModule } from './app/modules/list.module';
import { WsGateway } from './app/websocket/ws.gateway';
import { RedisModule } from './app/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_CONNECTION_URL),
    RedisModule,
    LoggerModule,
    BoardModule,
    CardModule,
    UserModule,
    ListModule,
  ],
  controllers: [AppController],
  providers: [AppService, WsGateway],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
