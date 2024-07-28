import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardController } from 'src/app/controllers/board.controller';
import { Board, BoardSchema } from 'src/app/models/schemas/board.schema';
import { LoggerModule } from './logger.module';
import { BoardService } from '../services/board.service';
import { EmailService } from '../services/email.service';
import { UserModule } from './user.module';
import { User, UserSchema } from '../models/schemas/user.shema';
import { Card, CardSchema } from '../models/schemas/card.schema';
import { List, ListSchema } from '../models/schemas/list.shema';

@Module({
  providers: [BoardService, EmailService],
  controllers: [BoardController],
  exports: [BoardService],
  imports: [
    MongooseModule.forFeature([
      { name: Board.name, schema: BoardSchema },
      { name: User.name, schema: UserSchema },
      { name: Card.name, schema: CardSchema },
      { name: List.name, schema: ListSchema },
    ]),
    LoggerModule,
    UserModule,
  ],
})
export class BoardModule {}
