import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Card, CardDocument, Label } from '../models/schemas/card.schema';
import { List, ListDocument } from '../models/schemas/list.shema';
import { Board, BoardDocument } from '../models/schemas/board.schema';
import { User, UserDocument } from '../models/schemas/user.shema';
import { validateCardOwners } from 'src/utils/helperMethods';
import { Activity, ActivityDocument } from '../models/schemas/activity.schema';
import { ObjectId } from 'mongodb';
import { uniqBy } from 'lodash';
import { secondsToTimeString } from 'src/utils/timeHelper';

@Injectable()
export class CardService {
  constructor(
    @InjectModel(Card.name) private readonly cardModel: Model<CardDocument>,
    @InjectModel(List.name) private readonly listModel: Model<ListDocument>,
    @InjectModel(Board.name) private readonly boardModel: Model<BoardDocument>,
    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(
    title: string,
    listId: string,
    boardId: string,
    user: User,
  ): Promise<List> {
    try {
      // Get list and board
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate the ownership
      const validate = await validateCardOwners(null, list, board, user, true);
      if (!validate) {
        throw new Error(
          'You dont have permission to add card to this list or board',
        );
      }

      // Create new card
      const card = await this.cardModel.create({
        board: board._id as ObjectId,
        title,
        owner: new ObjectId(listId),
        labels: [],
        checklists: [],
      });
      this.activityModel.create({
        user: user.id,
        text: `added this card to ${list.title}`,
        board: boardId,
        card: card._id,
        color: user.color,
        userName: user.name,
        list: listId,
      });

      // Add id of the new card to owner list
      list.cards.push(card._id as any);
      await list.save();

      // Add log to board activity
      board.activity.unshift({
        user: user._id,
        name: user.name,
        action: `added ${card.title} to this board`,
        color: user.color,
      });
      await board.save();

      // Set data transfer object
      const result = await this.listModel
        .findById(listId)
        .populate({ path: 'cards' })
        .exec();
      return result;
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteById(
    cardId: string,
    listId: string,
    boardId: string,
    user: User,
  ): Promise<{ message: string }> {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to update this card');
      }

      // Delete the card
      await this.cardModel.findByIdAndDelete(cardId);

      // Delete the list from lists of board
      list.cards = list.cards.filter(
        (tempCard) => tempCard.toString() !== cardId,
      );
      await list.save();

      // Add activity log to board
      // board.activity.unshift({
      //   user: user._id,
      //   name: user.name,
      //   action: `deleted ${card.title} from ${list.title}`,
      //   color: user.color,
      // });
      await board.save();

      return { message: 'Success' };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getCard(
    cardId: string,
    listId: string,
    boardId: string,
    user: User,
  ): Promise<any> {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);
      const activities = await this.activityModel.find({
        card: new ObjectId(cardId),
      });
      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to update this card');
      }

      const returnObject = {
        ...card.toJSON(),
        listTitle: list.title,
        listId,
        boardId,
        activities,
      };

      return returnObject;
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(
    cardId: string,
    listId: string,
    boardId: string,
    user: User,
    updatedObj: any,
  ): Promise<{ message: string }> {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to update this card');
      }

      // Update card
      await this.cardModel.updateOne({ _id: cardId }, updatedObj);

      return { message: 'Success!' };
    } catch (error) {
      throw new Error(error);
    }
  }

  async addComment(
    cardId: string,
    listId: string,
    boardId: string,
    user: User,
    body: any,
  ): Promise<any> {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to update this card');
      }
      // Add comment
      await this.activityModel.create({
        board: new ObjectId(boardId),
        card: new ObjectId(cardId),
        list: new ObjectId(listId),
        user: new ObjectId(user.id),
        text: body.text,
        color: user.color,
        userName: user.name,
        isComment: true,
      });

      return await this.activityModel.find({ card: new ObjectId(cardId) });
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateComment(
    cardId: string,
    listId: string,
    boardId: string,
    commentId: string,
    user: User,
    body: any,
  ): Promise<{ message: string }> {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to update this card');
      }

      // Update card
      const comment = await this.activityModel.findById(commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }
      if (comment.userName !== user.name) {
        throw new Error('You can not edit the comment that you haven not');
      }

      comment.text = body.text;
      await comment.save();

      await card.save();

      // Add to board activity
      this.activityModel.create({
        board: new ObjectId(boardId),
        card: new ObjectId(cardId),
        list: new ObjectId(listId),
        user: new ObjectId(user.id),
        text: body.text,
        color: user.color,
        userName: user.name,
        isComment: true,
        actionType: 'comment',
        cardTitle: card.title,
      });

      await board.save();

      return { message: 'Success!' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async deleteComment(
    cardId: string,
    listId: string,
    boardId: string,
    commentId: string,
    user: User,
  ): Promise<{ message: string }> {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to update this card');
      }

      // Delete card
      await this.activityModel.findByIdAndDelete(commentId);

      this.activityModel.create({
        board: new ObjectId(boardId),
        card: new ObjectId(cardId),
        list: new ObjectId(listId),
        user: new ObjectId(user.id),
        text: `deleted his/her own comment from ${card.title}`,
        color: user.color,
        userName: user.name,
        isComment: true,
        actionType: 'comment',
        cardTitle: card.title,
      });

      return { message: 'Success!' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async addMember(
    cardId: string,
    listId: string,
    boardId: string,
    user: User,
    memberId: string,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);
      const member = await this.userModel.findById(memberId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to add member this card');
      }

      // Add member
      card.members.unshift({
        user: member._id,
        name: member.name,
        color: member.color,
      });
      await card.save();

      // Add to board activity
      // board.activity.unshift({
      //   user: user._id,
      //   name: user.name,
      //   action: `added '${member.name}' to ${card.title}`,
      //   color: user.color,
      // });
      await board.save();

      return { message: 'success' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async deleteMember(
    cardId: string,
    listId: string,
    boardId: string,
    user: User,
    memberId: string,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to add member this card');
      }

      // Delete member
      card.members = card.members.filter(
        (a) => a.user.toString() !== memberId.toString(),
      );
      await card.save();

      // Get member
      const tempMember = await this.userModel.findById(memberId);

      // Add to board activity
      // board.activity.unshift({
      //   user: user._id,
      //   name: user.name,
      //   action:
      //     tempMember.name === user.name
      //       ? `left ${card.title}`
      //       : `removed '${tempMember.name}' from ${card.title}`,
      //   color: user.color,
      // });
      await board.save();

      return { message: 'success' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async createLabel(cardId, listId, boardId, user, label: Label) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to add label this card');
      }

      //Add label
      card.labels.unshift({
        text: label.text,
        color: label.color,
        backColor: label.backColor,
      });
      board.labels.unshift({
        text: label.text,
        color: label.color,
        backColor: label.backColor,
      });
      await card.save();
      await board.save();
      const labelId = card.labels[0]._id;

      return { labelId: labelId };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async updateLabel(cardId, listId, boardId, labelId, user, label) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to update this card');
      }
      board.labels = board.labels.map((item: any) => {
        if (item._id.toString() === labelId.toString()) {
          item.text = label.text;
          item.color = label.color;
          item.backColor = label.backColor;
        }
        return item;
      });
      // Update label
      card.labels = card.labels.map((item: any) => {
        if (item._id.toString() === labelId.toString()) {
          item.text = label.text;
          item.color = label.color;
          item.backColor = label.backColor;
        }
        return item;
      });
      await card.save();
      await board.save();
      return { message: 'Success!', labels: card.labels };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async deleteLabel(cardId, listId, boardId, labelId, user) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        return { errMessage: 'You dont have permission to delete this label' };
      }

      //Delete label
      board.labels = board.labels.filter(
        (label) => label._id.toString() !== labelId.toString(),
      );
      card.labels = card.labels.filter(
        (label) => label._id.toString() !== labelId.toString(),
      );
      await card.save();
      await board.save();

      return { message: 'Success!', labels: card.labels };
    } catch (error) {
      return {
        errMessage: 'Something went wrong',
        details: error.message,
      };
    }
  }

  async updateLabelSelection(cardId, listId, boardId, labelId, user, selected) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);
      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        return { errMessage: 'You dont have permission to update this card' };
      }

      //Update label
      const label = board.labels.find((item) => {
        return item._id.toString() === labelId.toString();
      });

      if (!label) {
        throw new Error('Label not found');
      }
      const labelIndex = card.labels.findIndex(
        (item) => item._id.toString() === labelId.toString(),
      );

      if (selected) {
        if (labelIndex === -1) {
          card.labels.push({
            _id: label._id,
            text: label.text,
            color: label.color,
            backColor: label.backColor,
          });
        }

        card.labels = uniqBy(card.labels, '_id');
      } else {
        card.labels = card.labels.filter(
          (item) => item._id.toString() !== labelId.toString(),
        );
      }

      await card.save();

      return { message: 'Success!', labels: card.labels };
    } catch (error) {
      return {
        errMessage: 'Something went wrong',
        details: error.message,
      };
    }
  }
  async createChecklist(cardId, listId, boardId, user, title) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);
      const loggedInUser = await this.userModel.findById(user.id);
      // Validate owner
      const validate = await validateCardOwners(
        card,
        list,
        board,
        loggedInUser,
        false,
      );
      if (!validate) {
        return {
          errMessage: 'You dont have permission to add Checklist this card',
        };
      }

      //Add checklist
      if (!card.checklists) card.checklists = [];
      card.checklists?.push({
        _id: new ObjectId(),
        title: title,
      });
      await card.save();

      const checklistId = card.checklists[card.checklists?.length - 1]._id;

      //Add to board activity
      // board.activity.unshift({
      //   user: user._id,
      //   name: user.name,
      //   action: `added '${title}' to ${card.title}`,
      //   color: user.color,
      // });
      await board.save();

      return { checklistId: checklistId };
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteChecklist(cardId, listId, boardId, checklistId, user) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        return {
          errMessage: 'You dont have permission to delete this checklist',
        };
      }
      let cl = card.checklists?.filter(
        (l) => l._id.toString() === checklistId.toString(),
      );
      //Delete checklist
      card.checklists = card.checklists?.filter(
        (list) => list._id.toString() !== checklistId.toString(),
      );
      await card.save();

      //Add to board activity
      // board.activity.unshift({
      //   user: user._id,
      //   name: user.name,
      //   action: `removed '${cl.title}' from ${card.title}`,
      //   color: user.color,
      // });
      await board.save();

      return { message: 'Success!' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async addChecklistItem(
    cardId: string,
    listId: string,
    boardId: string,
    user: User,
    checklistId: string,
    text: string,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        return {
          errMessage: 'You dont have permission to add item this checklist',
        };
      }

      //Add checklistItem
      card.checklists = card.checklists?.map((list: any) => {
        if (list._id.toString() == checklistId) {
          list.items.push({ text: text });
        }
        return list;
      });
      await card.save();

      // Get to created ChecklistItem's id
      let checklistItemId = '';
      card.checklists = card.checklists?.map((list: any) => {
        if (list._id.toString() == checklistId.toString()) {
          checklistItemId = list.items[list.items.length - 1]._id;
        }
        return list;
      });
      return { checklistItemId: checklistItemId };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async setChecklistItemCompleted(
    cardId: string,
    listId: string,
    boardId: string,
    user: User,
    checklistId: string,
    checklistItemId: string,
    completed: boolean,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        return {
          errMessage:
            'You dont have permission to set complete of this checklist item',
        };
      }
      let clItem = '';
      //Update completed of checklistItem
      card.checklists = card.checklists?.map((list: any) => {
        if (list._id.toString() == checklistId.toString()) {
          list.items = list.items.map((item: any) => {
            if (item._id.toString() === checklistItemId) {
              item.completed = completed;
              clItem = item.text;
            }
            return item;
          });
        }
        return list;
      });
      await card.save();

      //Add to board activity
      // board.activity.unshift({
      //   user: user._id,
      //   name: user.name,
      //   action: completed
      //     ? `completed '${clItem}' on ${card.title}`
      //     : `marked as uncompleted to '${clItem}' on ${card.title}`,
      //   color: user.color,
      // });
      await board.save();
      return { message: 'Success!' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async setChecklistItemText(
    cardId,
    listId,
    boardId,
    user,
    checklistId,
    checklistItemId,
    text,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error(
          'You dont have permission to set text of this checklist item',
        );
      }

      //Update text of checklistItem
      card.checklists = card.checklists?.map((list) => {
        if (list._id.toString() == checklistId.toString()) {
          list.items = list.items.map((item) => {
            if (item._id.toString() === checklistItemId) {
              item.text = text;
            }
            return item;
          });
        }
        return list;
      });
      await card.save();
      return { message: 'Success!' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async deleteChecklistItem(
    cardId: string,
    listId: string,
    boardId: string,
    user: User,
    checklistId: string,
    checklistItemId: string,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error(
          'You dont have permission to delete this checklist item',
        );
      }
      console.log(listId, boardId, cardId, checklistId, checklistItemId);
      // Delete checklistItem
      card.checklists = card.checklists?.map((list: any) => {
        if (list._id.toString() === checklistId.toString()) {
          list.items = list.items.filter(
            (item: any) => item._id.toString() !== checklistItemId,
          );
        }
        return list;
      });
      await card.save();
      return { message: 'Success!' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async updateStartDueDates(
    cardId: string,
    listId: string,
    boardId: string,
    user: User,
    startDate: Date,
    dueDate: Date,
    dueTime: string,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to update date of this card');
      }

      // Update dates
      card.date.startDate = startDate;
      card.date.dueDate = dueDate;
      card.date.dueTime = dueTime;
      if (dueDate === null) card.date.completed = false;
      await card.save();
      return { message: 'Success!' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async updateDateCompleted(
    cardId: string,
    listId: string,
    boardId: string,
    user: User,
    completed: boolean,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error(
          "You don't have permission to update the date of this card",
        );
      }

      // Update date completed event
      card.date.completed = completed;

      await card.save();

      // Add to board activity
      // board.activity.unshift({
      //   user: user._id,
      //   name: user.name,
      //   action: `marked the due date on ${card.title} ${
      //     completed ? 'complete' : 'uncomplete'
      //   }`,
      //   color: user.color,
      // });
      await board.save();

      return { message: 'Success!' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async addAttachment(
    cardId: string,
    listId: string,
    boardId: string,
    user: User,
    link: string,
    name: string,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to update date of this card');
      }

      //Add attachment
      const validLink = new RegExp(/^https?:\/\//).test(link)
        ? link
        : 'http://' + link;

      card.attachments?.push({ link: validLink, name: name });
      await card.save();

      //Add to board activity
      // board.activity.unshift({
      //   user: user._id,
      //   name: user.name,
      //   action: `attached ${validLink} to ${card.title}`,
      //   color: user.color,
      // });
      board.save();

      return {
        attachmentId:
          card.attachments[card.attachments?.length - 1]._id.toString(),
      };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async deleteAttachment(
    cardId: string,
    listId: string,
    boardId: string,
    user: User,
    attachmentId: string,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to delete this attachment');
      }

      let attachmentObj = card.attachments?.filter(
        (attachment) => attachment._id.toString() === attachmentId.toString(),
      );

      //Delete checklistItem
      card.attachments = card.attachments?.filter(
        (attachment) => attachment._id.toString() !== attachmentId.toString(),
      );
      await card.save();

      //Add to board activity
      // board.activity.unshift({
      //   user: user._id,
      //   name: user.name,
      //   action: `deleted the ${attachmentObj[0].link} attachment from ${card.title}`,
      //   color: user.color,
      // });
      await board.save();

      return { message: 'Success!' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async updateAttachment(
    cardId: string,
    listId: string,
    boardId: string,
    user: User,
    attachmentId: string,
    link: string,
    name: string,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error(
          'You dont have permission to update attachment of this card',
        );
      }

      //Update date completed event
      card.attachments = card.attachments?.map((attachment) => {
        if (attachment._id.toString() === attachmentId.toString()) {
          attachment.link = link;
          attachment.name = name;
        }
        return attachment;
      });

      await card.save();
      return { message: 'Success!' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async updateCover(
    cardId: string,
    listId: string,
    boardId: string,
    user: User,
    color: string,
    isSizeOne: boolean,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);

      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        throw new Error(
          'You dont have permission to update attachment of this card',
        );
      }

      //Update date cover color
      card.cover.color = color;
      card.cover.isSizeOne = isSizeOne;

      await card.save();
      return { message: 'Success!' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async estimateTime(
    cardId: string,
    listId: string,
    boardId: string,
    user: User,
    astimatedTime: number,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);
      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        return {
          errMessage: 'You dont have permission to add Checklist this card',
        };
      }

      //update estimated time
      card.timeTracking.estimateTime = astimatedTime;
      card.timeTracking.spentTime = 0;

      await card.save();

      //Add to Card activity
      this.activityModel.create({
        board: new ObjectId(boardId),
        card: new ObjectId(cardId),
        list: new ObjectId(listId),
        user: new ObjectId(user._id),
        text: `estimated time as ${secondsToTimeString(astimatedTime)} hours`,
        color: user.color,
        userName: user.name,
        isComment: false,
        actionType: 'time',
        cardTitle: card.title,
      });
      await board.save();

      return card.timeTracking;
    } catch (error) {
      throw new Error(error);
    }
  }

  async addTimeTracking(
    cardId: string,
    listId: string,
    boardId: string,
    user: User,
    time: number,
    comment: string,
    date: Date,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);
      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        return {
          errMessage: 'You dont have permission to add Checklist this card',
        };
      }

      //update estimated time
      if (!card.timeTracking.userTimeTracking) {
        card.timeTracking.userTimeTracking = [];
      }
      card.timeTracking.userTimeTracking.push({
        user: user._id,
        loggedTime: time,
        userName: `${user.name} ${user.surname}`,
        date: new Date(date),
        comment: comment,
      });

      card.timeTracking.spentTime = card.timeTracking.userTimeTracking.reduce(
        (acc, time) => acc + time.loggedTime,
        0,
      );

      await card.save();

      return card.timeTracking;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateTimeTracking(
    cardId: string,
    listId: string,
    boardId: string,
    timeTrackingId: string,
    user: User,
    time?: number,
    comment?: string,
    date?: Date,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);
      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        return {
          errMessage: 'You dont have permission to add Checklist this card',
        };
      }

      //update estimated time
      card.timeTracking.userTimeTracking =
        card.timeTracking.userTimeTracking.map((s) => {
          if (s._id.toString() === timeTrackingId) {
            if (time && time > 0) {
              s.loggedTime = time;
            }

            if (comment) {
              s.comment = comment;
            }
            if (date) {
              s.date = new Date(date);
            }
          }
          return s;
        });

      card.timeTracking.spentTime = card.timeTracking.userTimeTracking.reduce(
        (acc, time) => acc + time.loggedTime,
        0,
      );

      await card.save();

      return card.timeTracking;
    } catch (error) {
      throw new Error(error);
    }
  }
  async deleteTimeTracking(
    cardId: string,
    listId: string,
    boardId: string,
    timeTrackingId: string,
    user: User,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findById(boardId);
      // Validate owner
      const validate = await validateCardOwners(card, list, board, user, false);
      if (!validate) {
        return {
          errMessage: 'You dont have permission to add Checklist this card',
        };
      }

      //update estimated time
      card.timeTracking.userTimeTracking =
        card.timeTracking.userTimeTracking.filter(
          (time) => time._id.toString() !== timeTrackingId,
        );

      card.timeTracking.spentTime = card.timeTracking.userTimeTracking.reduce(
        (acc, time) => acc + time.loggedTime,
        0,
      );
      await card.save();

      return card.timeTracking;
    } catch (error) {
      throw new Error(error);
    }
  }
}
