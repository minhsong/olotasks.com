import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types, Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ collection: 'notifications', timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user: Types.ObjectId;

  @Prop({
    type: { id: Types.ObjectId, name: String, color: String, avatar: String },
    required: true,
    _id: false,
  })
  sender: { id: Types.ObjectId; name: string; color: string; avatar: string };

  @Prop({ required: true })
  text: string;

  @Prop({ default: false })
  isRead?: boolean;

  @Prop({
    type: { id: String, name: String },
    required: true,
    _id: false,
  })
  board: { id: string; name: string };

  @Prop({ type: { id: Types.ObjectId, name: String }, _id: false })
  card?: { id: Types.ObjectId; name: string };

  @Prop({
    type: String,
    enum: [
      'card.update',
      'card.delete',
      'card.member.add',
      'card.member.delete',
      'card.member.join',
      'card.mention',
      'card.rename',
      'card.comment.add',
      'card.comment.update',
      'card.comment.delete',
      'card.attachment.add',
      'card.attachment.delete',
      'card.dueDate',
      'card.watch',
      'card.unwatch',
      'card.label.add',
      'card.label.delete',
      'card.label.update',
      'card.move',
      'card.checklist.add',
      'card.checklist.delete',
      'card.checklist.update',
      'card.timeTracking.estimate',
    ],
    required: true,
  })
  type: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
