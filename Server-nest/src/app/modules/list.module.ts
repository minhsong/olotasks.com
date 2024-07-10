import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from './logger.module';
import { ListService } from '../services/list.service';
import { ListRouteController } from '../controllers/list.controller';
import { List, ListSchema } from '../models/schemas/list.shema';
import { BoardModule } from './board.module';
import { Board, BoardSchema } from '../models/schemas/board.schema';
import { Card, CardSchema } from '../models/schemas/card.schema';
import { UserModule } from './user.module';
import { User, UserSchema } from '../models/schemas/user.shema';
import { Activity, ActivitySchema } from '../models/schemas/activity.schema';

@Module({
  providers: [ListService],
  controllers: [ListRouteController],
  exports: [ListService],
  imports: [
    MongooseModule.forFeature([
      { name: List.name, schema: ListSchema },
      { name: Board.name, schema: BoardSchema },
      { name: Card.name, schema: CardSchema },
      { name: User.name, schema: UserSchema },
      { name: Activity.name, schema: ActivitySchema },
    ]),
    LoggerModule,
    BoardModule,
    UserModule,
  ],
})
export class ListModule {}
