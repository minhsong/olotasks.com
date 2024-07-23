import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types, Document } from 'mongoose';
import { Label, LabelSchema } from './card.schema';
import { generateRandomString } from 'src/utils/helperMethods';

@Schema()
export class BoardMember {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  surname: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: 'member' })
  role: string;

  @Prop({ required: true })
  color: string;
}

export const BoardMemberSchema = SchemaFactory.createForClass(BoardMember);

@Schema()
export class BoardActivity {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  action: string;

  @Prop({ default: Date.now })
  date?: Date;

  @Prop({ default: false })
  edited?: boolean;

  @Prop({ default: '' })
  cardTitle?: string;

  @Prop({ default: 'action' })
  actionType?: string;

  @Prop({ default: '' })
  color?: string;
}

export const BoardActivitySchema = SchemaFactory.createForClass(BoardActivity);

export type BoardDocument = Board & Document;

@Schema({ collection: 'boards', timestamps: true, versionKey: '__v' })
export class Board {
  @Prop({ required: true, unique: true, default: generateRandomString() })
  shortId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: true })
  isImage: boolean;

  @Prop({ required: true })
  backgroundImageLink: string;

  @Prop([LabelSchema])
  labels: Label[];

  @Prop({ type: [BoardActivitySchema], default: [] })
  activity: BoardActivity[];

  @Prop([BoardMemberSchema])
  members: BoardMember[];

  @Prop([{ type: Types.ObjectId, ref: 'List' }])
  lists: Types.ObjectId[];

  @Prop({ default: '' })
  description: string;

  __v: number;
}

export const BoardSchema = SchemaFactory.createForClass(Board);
