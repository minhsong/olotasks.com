import { Types } from 'mongoose';

export type CreateListModel = {
  title: string;
  cards?: string[];
  owner: Types.ObjectId;
};
