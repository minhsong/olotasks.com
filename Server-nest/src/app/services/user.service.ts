import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  createRandomHexColor,
  generateRandomString,
  userpublic,
} from 'src/utils/helperMethods';
import { User, UserDocument } from '../models/schemas/user.shema';
import { comparePasswords, hashPassword } from 'src/utils/jwthelper';
import { Board, BoardDocument } from '../models/schemas/board.schema';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Board.name) private readonly boardModel: Model<BoardDocument>,
    private readonly redisService: RedisService,
  ) {}

  async register(user) {
    const userExist = await this.userModel.findOne({ email: user.email });
    if (!userExist) {
      return this.userModel.create({
        ...user,
        status: 'registered',
        color: createRandomHexColor(),
      });
    } else {
      if (userExist.status === 'inviting') {
        return await this.updateUser(userExist._id, {
          name: user.name,
          surename: user.surename,
          password: user.password,
          status: 'invited',
        });
      } else {
        return userExist;
      }
    }
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
      const boards = await this.boardModel.find({ _id: { $in: user.boards } });
      return {
        ...user.toJSON(),
        boards: boards.map((s) => {
          return {
            _id: s._id,
            shortId: s.shortId,
            title: s.title,
            isImage: s.isImage,
            backgroundImageLink: s.backgroundImageLink,
          };
        }),
      };
    } catch (err) {
      throw new Error('Something went wrong');
    }
  }

  async getUser(id): Promise<any> {
    const user = await this.userModel.findById(id);

    if (!user) return null;
    const boards = await this.boardModel.find({ _id: { $in: user.boards } });
    const trimmedUser = await userpublic(user.toJSON());
    return {
      ...trimmedUser,
      boards: boards.map((s) => {
        return {
          _id: s._id,
          shortId: s.shortId,
          title: s.title,
          isImage: s.isImage,
          backgroundImageLink: s.backgroundImageLink,
        };
      }),
    };
  }

  async getUserWithMail(email): Promise<any> {
    try {
      let user = await this.userModel.findOne({ email });
      if (!user) {
        return null;
      }

      return { ...user.toJSON() };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUsersByEmails(emails): Promise<User[]> {
    try {
      const users = await this.userModel.find({ email: { $in: emails } });
      return users;
    } catch (error) {
      throw new Error(error);
    }
  }

  async createUserWithEmail(email): Promise<User> {
    return await this.userModel.create({
      email,
      color: createRandomHexColor(),
      name: email.split('@')[0],
      surename: '',
      password: await hashPassword(generateRandomString(6)),
      status: 'inviting',
    });
  }

  async updateCacheUser(userIds): Promise<any> {
    try {
      if (userIds) {
        userIds.map(async (userId) => {
          this.getUser(userId).then((user) => {
            this.redisService.SetUserData(user);
          });
        });
      }
    } catch (error) {}
  }

  async updatePassword(email, password): Promise<any> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        return null;
      }
      user.password = password;
      await user.save();
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateUser(id, user): Promise<any> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(id, user, {
        new: true,
      });

      // update board members status
      const boards = await this.boardModel.find({
        _id: { $in: updatedUser.boards },
      });
      boards.map(async (board) => {
        board.members.map((member) => {
          if (member.user.toString() === updatedUser._id.toString()) {
            member.status = 'active';
            member.name = updatedUser.name;
            member.surename = updatedUser.surename;
          }
        });
        await board.save();
      });
      return updatedUser;
    } catch (error) {
      throw new Error(error);
    }
  }
}
