import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from './logger.module';
import { User, UserSchema } from '../models/schemas/user.shema';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';

@Module({
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    LoggerModule,
  ],
})
export class UserModule {}
