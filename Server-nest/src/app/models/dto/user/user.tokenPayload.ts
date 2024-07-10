import { ObjectId } from 'mongodb';

export class UserTokenPayload {
  email: string;
  id: string | ObjectId;
}
