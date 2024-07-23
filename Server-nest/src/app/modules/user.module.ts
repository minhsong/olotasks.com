import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from './logger.module';
import { User, UserSchema } from '../models/schemas/user.shema';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { NotificationController } from '../controllers/notification.controller';
import { NotificationService } from '../services/notification.service';
import {
  Notification,
  NotificationSchema,
} from '../models/schemas/notification.schema';

@Module({
  providers: [UserService, NotificationService],
  controllers: [UserController, NotificationController],
  exports: [UserService],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    LoggerModule,
  ],
})
export class UserModule {}
