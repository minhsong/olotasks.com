import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types, Document } from 'mongoose';

export type UserDocument = User & Document;
@Schema({ collection: 'users', timestamps: true })
export class User extends Document {
  _id: Types.ObjectId;
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  surname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  avatar: string;

  @Prop()
  color: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Board' }] })
  boards: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);