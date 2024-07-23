import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/app/models/schemas/user.shema';
import { defaultlBoardabels } from 'src/constants/variables';
import { Board, BoardDocument } from 'src/app/models/schemas/board.schema';
import { CreateBoardDto } from '../models/dto/board/board.create';
import { UserTokenPayload } from '../models/dto/user/user.tokenPayload';
import { ObjectId } from 'mongodb';
import { uniqBy } from 'lodash';
import { Card, CardDocument } from '../models/schemas/card.schema';
import { generateRandomString } from 'src/utils/helperMethods';
import { List, ListDocument } from '../models/schemas/list.shema';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private readonly boardModel: Model<BoardDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Card.name) private readonly cardModel: Model<CardDocument>,
    @InjectModel(List.name) private readonly listModel: Model<ListDocument>,
  ) {}

  async create(
    data: CreateBoardDto,
    loggedUser: UserTokenPayload,
  ): Promise<Board> {
    try {
      const { title, backgroundImageLink, members } = data;

      const id = generateRandomString();
      // Create and save new board
      const newBoard = await this.boardModel.create({
        title,
        shortId: id,
        backgroundImageLink,
        labels: defaultlBoardabels.map((label) => ({
          ...label,
          _id: new ObjectId(),
        })),
      });

      // Add this board to owner's boards
      const user = await this.userModel.findById(loggedUser.id);
      user.boards.unshift(newBoard.id);
      await user.save();

      // Add user to members of this board
      const allMembers = [];
      allMembers.push({
        user: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        color: user.color,
        role: 'owner',
      });

      // Save newBoard's id to boards of members and,
      // Add ids of members to newBoard
      await Promise.all(
        members.map(async (member) => {
          const newMember = await this.userModel.findOne({
            email: member.email,
          });
          newMember.boards.push(newBoard.id);
          await newMember.save();
          allMembers.push({
            user: newMember.id,
            name: newMember.name,
            surname: newMember.surname,
            email: newMember.email,
            color: newMember.color,
            role: 'member',
          });
          // Add to board activity
          newBoard.activity.push({
            user: user._id as any,
            name: user.name,
            action: `added user '${newMember.name}' to this board`,
          });
        }),
      );

      // Add created activity to activities of this board
      newBoard.activity.unshift({
        user: user.id,
        name: user.name,
        action: 'created this board',
        color: user.color,
      });

      // Save new board
      newBoard.members = allMembers;
      await newBoard.save();

      return newBoard;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  async getAll(userId): Promise<Board[]> {
    try {
      // Get user
      const user = await this.userModel.findById(userId);

      // Get board's ids of user
      const boardIds = user.boards;

      // Get boards of user
      const boards = await this.boardModel.find({ _id: { $in: boardIds } });

      // Delete unnecessary objects
      boards.forEach((board) => {
        // board.activity = undefined;
        board.lists = undefined;
      });

      return boards;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getById(id): Promise<Board> {
    try {
      // Get board by id
      const board = await this.boardModel.findById(id);
      return board;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getBoardByShortId(shortId): Promise<Board> {
    try {
      // Get board by id
      const board = await this.boardModel.findOne({ shortId });
      return board;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getActivityById(id): Promise<any> {
    try {
      // Get board by id
      const board = await this.boardModel.findById(id);
      return board.activity;
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async updateBoardTitle(boardId, title, user): Promise<any> {
    try {
      // Get board by id
      const board = await this.boardModel.findById(boardId);
      board.title = title;
      // board.activity.unshift({
      //   user: user._id,
      //   name: user.name,
      //   action: 'update title of this board',
      //   color: user.color,
      //   date: new Date(),
      // });
      await board.save();
      return { message: 'Success!' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async updateBoardDescription(boardId, description, user): Promise<any> {
    try {
      // Get board by id
      const board = await this.boardModel.findById(boardId);
      board.description = description;
      // board.activity.unshift({
      //   user: user._id,
      //   name: user.name,
      //   action: 'update description of this board',
      //   color: user.color,
      // });
      await board.save();
      return { message: 'Success!' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async updateBackground(id, background, isImage, user): Promise<any> {
    try {
      // Get board by id
      const board = await this.boardModel.findById(id);

      // Set variables
      board.backgroundImageLink = background;
      board.isImage = isImage;

      // Log the activity
      // board.activity.unshift({
      //   user: user._id,
      //   name: user.name,
      //   action: 'update background of this board',
      //   color: user.color,
      // });

      // Save changes
      await board.save();

      return board;
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async addMember(id, members, user): Promise<any> {
    try {
      // Get board by id
      const board = await this.boardModel.findOne({ shortId: id });

      // Validate whether params.id is in the user's boards or not
      const validate = user.boards.filter(
        (board) => board.toString() === board._id.toString(),
      );
      if (!validate)
        throw new Error(
          'You can not add member to this board, you are not a member or owner!',
        );
      // Set variables
      await Promise.all(
        members.map(async (member) => {
          const newMember = await this.userModel.findById(member._id);
          newMember.boards.push(board._id as any);
          await newMember.save();
          board.members.push({
            user: newMember._id,
            name: newMember.name,
            surname: newMember.surname,
            email: newMember.email,
            color: newMember.color,
            role: 'member',
          });

          board.members = uniqBy(board.members, 'user');

          // Add to board activity
          // board.activity.push({
          //   user: user.id,
          //   name: user.name,
          //   action: `added user '${newMember.name}' to this board`,
          //   color: user.color,
          // });
        }),
      );
      // Save changes
      await board.save();

      return board.members;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getFixedBoards(): Promise<Board[]> {
    try {
      //get all bard
      const boards = await this.boardModel.find({});
      //go through all boards and get all lists

      boards.forEach(async (board) => {
        // const cards = await this.cardModel.updateMany(
        //   {
        //     owner: { $in: board.lists },
        //   },
        //   { board: board._id },
        // );

        // await this.cardModel.updateMany(
        //   {
        //     owner: { $in: board.lists.map((s) => s.toString()) },
        //   },
        //   { board: board._id },
        // );
        board.shortId = generateRandomString();

        board.save();
      });

      return boards;
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }
}
