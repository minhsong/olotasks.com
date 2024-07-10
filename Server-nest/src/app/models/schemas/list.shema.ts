import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types, Document, Schema as MongooseSchema } from 'mongoose';

export type ListDocument = List & Document;

@Schema({ collection: 'lists', timestamps: true })
export class List {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Card' })
  cards: Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Board' })
  owner: Types.ObjectId;
}

export const ListSchema = SchemaFactory.createForClass(List);
