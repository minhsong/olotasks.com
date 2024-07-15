import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createRandomHexColor } from 'src/utils/helperMethods';
import { User, UserDocument } from '../models/schemas/user.shema';
import { comparePasswords } from 'src/utils/jwthelper';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async register(user) {
    return this.userModel.create({
      ...user,
      color: createRandomHexColor(),
    });
  }

  async login(email, password): Promise<any> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        return null;
      }

      const isMatch = await comparePasswords(password, user.password);
      if (!isMatch) {
        return null;
      }
      return { ...user.toJSON() };
    } catch (err) {
      throw new Error('Something went wrong');
    }
  }

  async getUser(id) {
    return await this.userModel.findById(id);
  }

  async getUserWithMail(email): Promise<any> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new Error('There is no registered user with this e-mail.');
      }

      return { ...user.toJSON() };
    } catch (error) {
      throw new Error(error);
    }
  }
}
