import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types, Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Activity } from './activity.schema';
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

@Schema({ collection: 'cards' })
export class Card extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Board', default: [] })
  board?: Types.ObjectId;

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
    _id: true,
  })
  members: {
    _id?: Types.ObjectId;
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
    type: [
      {
        link: { type: String },
        name: { type: String, default: null },
        date: { type: Date, default: Date.now },
      },
    ],
    default: [],
    _id: true,
  })
  attachments?: {
    _id?: Types.ObjectId;
    link: string;
    name: string;
    date?: Date;
  }[];

  activities?: Activity[];

  @Prop({ type: Types.ObjectId, ref: 'List' })
  owner: Types.ObjectId;

  @Prop({
    type: {
      color: { type: String, default: null },
      isSizeOne: { type: Boolean, default: null },
    },
    default: { color: null, isSizeOne: null },
  })
  cover?: {
    color: string;
    isSizeOne: boolean;
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
