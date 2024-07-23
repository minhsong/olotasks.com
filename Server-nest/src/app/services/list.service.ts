import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { List, ListDocument } from '../models/schemas/list.shema';
import { Board, BoardDocument } from '../models/schemas/board.schema';
import { Card, CardDocument } from '../models/schemas/card.schema';
import { CreateListModel } from '../models/dto/list/list.create';
import { ObjectId } from 'mongodb';
import { Activity, ActivityDocument } from '../models/schemas/activity.schema';
import { User, UserDocument } from '../models/schemas/user.shema';

@Injectable()
export class ListService {
  constructor(
    @InjectModel(List.name) private readonly listModel: Model<ListDocument>,
    @InjectModel(Board.name) private readonly boardModel: Model<BoardDocument>,
    @InjectModel(Card.name) private readonly cardModel: Model<CardDocument>,
    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(model: CreateListModel, user): Promise<List> {
    try {
      // Create new List
      const ownerBoard = await this.boardModel.findOne({
        shortId: model.owner,
      });

      const newList = await this.listModel.create({
        ...model,
        owner: ownerBoard._id,
      });

      // Get owner board

      // Add newList's id to owner board
      ownerBoard.lists.push(newList._id as ObjectId);

      // Add created activity to owner board activities
      ownerBoard.activity.unshift({
        user: user._id,
        name: user.name,
        action: `added ${newList.title} to this board`,
        color: user.color,
      });

      // Save changes
      await ownerBoard.save();

      // Return new list
      return newList;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAll(boardId: string): Promise<List[]> {
    try {
      // Get lists whose owner id equals to boardId param
      const board = await this.boardModel.findOne({ shortId: boardId });
      if (!board) throw new Error('Board not found');
      const lists = await this.listModel
        .find({ owner: board._id })
        .populate({ path: 'cards' })
        .exec();

      // Order the lists

      const responseObject = board.lists.map((listId) => {
        return lists.find(
          (listObject) => listObject._id.toString() === listId.toString(),
        );
      });

      return responseObject;
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteById(listId, boardId, user): Promise<List> {
    try {
      // Get board to check the parent of list is this board
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate the parent of the list
      const validate = board.lists.find((list) => list.toString() === listId);
      if (!validate) throw new Error('List or board information is wrong');

      // Validate whether the owner of the board is the user who sent the request.
      if (!user.boards.includes(board._id.toString()))
        throw new Error(
          'You cannot delete a list that is not hosted by your boards',
        );

      // Delete the list
      const result = await this.listModel.findByIdAndDelete(listId);

      // Delete the list from lists of board
      board.lists = board.lists.filter((list) => list.toString() !== listId);

      // Add activity log to board
      board.activity.unshift({
        user: user._id,
        name: user.name,
        action: `deleted ${result.title} from this board`,
        color: user.color,
      });
      await board.save();

      // Delete all cards in the list
      await this.cardModel.deleteMany({ owner: listId });

      return result;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateCardOrder(
    boardId,
    sourceId,
    destinationId,
    destinationIndex,
    cardId,
    user,
  ): Promise<{ message: string }> {
    try {
      // Validate the parent board of the lists
      const board = await this.boardModel.findOne({ shortId: boardId });
      const loggedInUser = await this.userModel.findById(user.id);
      const validate = board.lists.find((list) => list.toString() === sourceId);
      // Validate the owner of board
      const ownerValidate = user.boards.filter((board) => board === board._id);
      if (!ownerValidate)
        throw new Error('You cannot change the order of this card');

      const validate2 =
        board && board.lists.find((list) => list.toString() === destinationId);
      if (!validate || !validate2)
        throw new Error('List or board information is wrong');

      // Validate the parent list of the card
      const sourceList = await this.listModel.findById(sourceId);
      const validate3 = sourceList.cards.find(
        (card) => card._id.toString() === cardId,
      );
      if (!validate3) throw new Error('List or card information is wrong');

      if (destinationId !== sourceId) {
        // Remove the card from source list and save
        sourceList.cards = sourceList.cards.filter(
          (card) => card.toString() !== cardId,
        );
        await sourceList.save();

        // Insert the card to destination list and save
        const card = await this.cardModel.findById(cardId);
        const destinationList = await this.listModel.findById(destinationId);
        const temp = Array.from(destinationList.cards);
        temp.splice(destinationIndex, 0, cardId);
        destinationList.cards = temp;
        await destinationList.save();
        // Add card activity
        // Change owner board of card
        card.owner = destinationId;
        await card.save();

        this.activityModel.create({
          board: boardId,
          userName: loggedInUser.name,
          card: new ObjectId(cardId),
          user: loggedInUser.id,
          text: `moved this card from ${sourceList.title} to ${destinationList.title}`,
          color: loggedInUser.color,
          type: 'card.move',
        });
      } else {
        // Change order of card in the same list
        const list = await this.listModel.findById(sourceId);
        const sourceIndex = list.cards.findIndex(
          (card) => card.toString() === cardId,
        );

        list.cards.splice(sourceIndex, 1);
        list.cards.splice(destinationIndex, 0, cardId);
        await list.save();
      }

      return { message: 'Success' };
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateListOrder(
    boardId,
    sourceIndex,
    destinationIndex,
    listId,
    user,
  ): Promise<{ message: string }> {
    try {
      // Validate the parent board of the lists
      const board = await this.boardModel.findOne({ shortId: boardId });

      const validate =
        board && board.lists.find((list) => list.toString() === listId);

      // Validate the owner of board
      const ownerValidate = user.boards.filter(
        (board) => board === board._id.toString(),
      );
      if (!ownerValidate)
        throw new Error('You cannot change the order of this list');

      if (!validate) throw new Error('List or board information is wrong');

      // Change list order
      board.lists.splice(sourceIndex, 1);
      board.lists.splice(destinationIndex, 0, listId);
      await board.save();

      return { message: 'Success' };
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateListTitle(
    listId,
    boardId,
    user,
    title,
  ): Promise<{ message: string }> {
    try {
      // Get board to check the parent of list is this board
      const board = await this.boardModel.findOne({ shortId: boardId });
      const list = await this.listModel.findById(listId.toString());
      // Validate the parent of the list
      const validate =
        board && board.lists.find((list) => list.toString() === listId);
      if (!validate) throw new Error('List or board information is wrong');

      // Validate whether the owner of the board is the user who sent the request.
      if (!user.boards.includes(board._id.toString()))
        throw new Error(
          'You cannot delete a list that is not hosted by your boards',
        );

      // Change title of list
      list.title = title;
      await list.save();

      return { message: 'Success' };
    } catch (error) {
      throw new Error(error);
    }
  }
}
