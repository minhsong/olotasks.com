import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardController } from 'src/app/controllers/board.controller';
import { Board, BoardSchema } from 'src/app/models/schemas/board.schema';
import { LoggerModule } from './logger.module';
import { BoardService } from '../services/board.service';
import { UserModule } from './user.module';
import { User, UserSchema } from '../models/schemas/user.shema';

@Module({
  providers: [BoardService],
  controllers: [BoardController],
  exports: [BoardService],
  imports: [
    MongooseModule.forFeature([
      { name: Board.name, schema: BoardSchema },
      { name: User.name, schema: UserSchema },
    ]),
    LoggerModule,
    UserModule,
  ],
})
export class BoardModule {}