import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types, Document } from 'mongoose';
import { Card } from './card.schema';
import { Board } from './board.schema';

export type ActivityDocument = Activity & Document;

@Schema({ collection: 'activities', timestamps: true })
export class Activity {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Board' })
  board: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Card' })
  card?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'List' })
  list?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  text: string;

  @Prop()
  date?: Date;

  @Prop({ default: false })
  isComment?: boolean;

  @Prop({ required: true })
  color: string;

  @Prop()
  cardTitle?: string;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
