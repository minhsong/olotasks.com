import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types, Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Activity, ActivitySchema } from './activity.schema';
export type CardDocument = Card & Document;

@Schema()
export class Label {
  @Prop({ type: Types.ObjectId, default: new ObjectId() })
  _id?: Types.ObjectId;

  @Prop({ default: '' })
  text: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  backColor: string;
}

export const LabelSchema = SchemaFactory.createForClass(Label);

@Schema({ timestamps: true, _id: true })
export class ChecklistItem {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  text: string;
  @Prop({ default: false })
  completed?: boolean;

  @Prop({
    type: {
      cardId: { type: Types.ObjectId, ref: 'Card' }, // Assuming you have a Card model
      title: { type: String },
    },
    _id: false,
    required: false,
  })
  subtask?: {
    cardId: Types.ObjectId;
    title: string;
  };
}

@Schema()
export class CardUserTimeTracking {
  _id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop()
  userName: string;

  @Prop({ default: 0 })
  loggedTime: number;

  @Prop({ default: new Date() })
  date: Date;

  @Prop()
  comment?: string;
}

@Schema()
export class CardTimeTracking {
  _id?: Types.ObjectId;
  @Prop()
  estimateTime: number;
  @Prop()
  spentTime?: number;

  @Prop({ type: [CardUserTimeTracking], default: [], _id: true })
  userTimeTracking?: CardUserTimeTracking[];
}

export const ChecklistItemSchema = SchemaFactory.createForClass(ChecklistItem);

@Schema({ _id: true })
export class Attachment {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  link: string;

  @Prop()
  name: string;

  @Prop({ default: Date.now })
  date?: Date;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, any>;

  @Prop()
  thumbnail?: string;

  @Prop({
    type: String,
    enum: ['link', 'file', 'image', 'video', 'audio', 'document', 'other'],
    default: 'link',
  })
  fileType?: string;

  @Prop({ default: false })
  isInternal?: boolean;

  @Prop()
  mineType?: string;
}
export const AttachmentSchema = SchemaFactory.createForClass(Attachment);

@Schema()
export class Comment {
  _id?: Types.ObjectId;
  @Prop({
    type: {
      user: { type: Types.ObjectId, ref: 'User' },
      name: { type: String },
      color: { type: String },
    },
    required: true,
  })
  sender: {
    user: Types.ObjectId;
    name: string;
    color: string;
  };

  @Prop()
  text: string;

  @Prop({ default: Date.now })
  date?: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema({ collection: 'cards', timestamps: true })
export class Card extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Board', default: [] })
  board: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: [LabelSchema], default: [] })
  labels: Label[];

  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: 'User' },
        name: { type: String },
        color: { type: String },
      },
    ],
    default: [],
  })
  members: {
    user: Types.ObjectId;
    name: string;
    color: string;
  }[];

  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: 'User' },
        name: { type: String },
      },
    ],
    default: [],
  })
  watchers: {
    user: Types.ObjectId;
    name: string;
  }[];

  @Prop({
    type: {
      startDate: { type: Date },
      dueDate: { type: Date },
      warningDate: { type: Date },
      dueTime: { type: String },
      reminder: { type: Boolean },
      completed: { type: Boolean, default: false },
    },
    default: {
      startDate: null,
      dueDate: null,
      warningDate: null,
      dueTime: null,
      reminder: false,
      completed: false,
    },
  })
  date?: {
    startDate: Date;
    dueDate: Date;
    warningDate: Date;
    dueTime: String;
    reminder: Boolean;
    completed: Boolean;
  };

  @Prop({
    type: [AttachmentSchema],
    default: [],
    _id: true,
  })
  attachments: Attachment[];

  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];

  activities?: Activity[];

  @Prop({ type: Types.ObjectId, ref: 'List' })
  owner: Types.ObjectId;

  @Prop({
    type: {
      color: { type: String, default: null },
      isSizeOne: { type: Boolean, default: null },
      thumbnail: { type: String, default: null },
    },
    default: { color: null, isSizeOne: null },
  })
  cover?: {
    color: string;
    isSizeOne: boolean;
    thumbnail?: string;
  };

  @Prop({
    type: [
      {
        items: { type: [ChecklistItemSchema], default: [] },
        title: { type: String },
      },
    ],
    default: [],
    _id: true,
  })
  checklists?: {
    _id?: Types.ObjectId;
    items?: ChecklistItem[];
    title: string;
  }[];

  @Prop({
    type: CardTimeTracking,
    default: {
      estimatedTime: null,
      loggedTime: null,
      userTimeTracking: [],
    },
  })
  timeTracking?: CardTimeTracking;
}

export const CardSchema = SchemaFactory.createForClass(Card);
