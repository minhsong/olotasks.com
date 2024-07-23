import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from './logger.module';
import { CardService } from '../services/card.service';
import { cardController } from '../controllers/card.controller';
import { Card, CardSchema } from '../models/schemas/card.schema';
import { ListModule } from './list.module';
import { BoardModule } from './board.module';
import { List, ListSchema } from '../models/schemas/list.shema';
import { Board, BoardSchema } from '../models/schemas/board.schema';
import { User, UserSchema } from '../models/schemas/user.shema';
import { UserModule } from './user.module';
import { Activity, ActivitySchema } from '../models/schemas/activity.schema';
import { SpacesService } from '../services/spaces.service';
import { WsGateway } from '../websocket/ws.gateway';
import {
  Notification,
  NotificationSchema,
} from '../models/schemas/notification.schema';
import { NotificationService } from '../services/notification.service';

@Module({
  providers: [CardService, SpacesService, NotificationService, WsGateway],
  controllers: [cardController],
  exports: [CardService],
  imports: [
    MongooseModule.forFeature([
      { name: Card.name, schema: CardSchema },
      { name: List.name, schema: ListSchema },
      { name: Board.name, schema: BoardSchema },
      { name: User.name, schema: UserSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    LoggerModule,
    ListModule,
    BoardModule,
    UserModule,
  ],
})
export class CardModule {}
