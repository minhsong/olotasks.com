import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Attachment,
  Card,
  CardDocument,
  Label,
} from '../models/schemas/card.schema';
import { List, ListDocument } from '../models/schemas/list.shema';
import { Board, BoardDocument } from '../models/schemas/board.schema';
import { User, UserDocument } from '../models/schemas/user.shema';
import {
  getFileCategory,
  getThumbnailFromMeta,
  validateCardOwners,
} from 'src/utils/helperMethods';
import { Activity, ActivityDocument } from '../models/schemas/activity.schema';
import { ObjectId } from 'mongodb';
import { uniqBy } from 'lodash';
import { secondsToTimeString } from 'src/utils/timeHelper';
import { SpacesService } from './spaces.service';
const urlMetadata = require('url-metadata');

@Injectable()
export class CardService {
  constructor(
    @InjectModel(Card.name) private readonly cardModel: Model<CardDocument>,
    @InjectModel(List.name) private readonly listModel: Model<ListDocument>,
    @InjectModel(Board.name) private readonly boardModel: Model<BoardDocument>,
    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly SpacesService: SpacesService,
  ) {}

  async fixCardComment() {
    try {
      const cards = await this.cardModel.find();

      cards.forEach(async (card) => {
        const activities = await this.activityModel.find({
          card: card._id,
        });
        card.comments = activities
          .filter((a: any) => a.isComment)
          .map((s: any) => {
            return {
              sender: {
                user: s.user,
                name: s.userName,
                color: s.color,
              },
              text: s.text,
              date: s.createdAt as Date,
            };
          });
        await card.save();

        // await this.activityModel.deleteMany({
        //   card: card._id,
        //   isComment: true,
        // });
      });
      return { message: 'Success!' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async create(
    title: string,
    listId: string,
    boardId: string,
    user: User,
  ): Promise<List> {
    try {
      // Get list and board
      const list = await this.listModel.findById(listId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate the ownership
      const validate = await validateCardOwners(null, board, user, true);
      if (!validate) {
        throw new Error(
          'You dont have permission to add card to this list or board',
        );
      }

      // Create new card
      const card = await this.cardModel.create({
        board: board._id,
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
        type: 'card.create',
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

  async deleteById(cardId: string, boardId: string, user: User): Promise<Card> {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const list = await this.listModel.findById(card.owner);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
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

      return await card.toJSON();
    } catch (error) {
      throw new Error(error);
    }
  }

  async getCard(
    cardId: string,
    boardId: string,
    user: User,
  ): Promise<Card & any> {
    try {
      // Get models
      const card = (await this.cardModel
        .findById(cardId)
        .populate('board')
        .exec()) as any;

      if (!card || !card.board || card.board.shortId !== boardId) {
        throw new Error('Card not found');
      }
      // Validate owner
      const validate = card.board.members.find(
        (m) => m.user.toString() === user._id.toString(),
      );
      if (!validate) {
        throw new Error('You dont have permission to update this card');
      }

      const returnObject = {
        ...card.toJSON(),
        listId: card.owner,
        boardId,
        board: card.board._id,
      };

      return returnObject;
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(
    cardId: string,
    boardId: string,
    user: User,
    updatedObj: any,
  ): Promise<{ message: string }> {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
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
    boardId: string,
    user: User,
    body: any,
  ): Promise<Card> {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to update this card');
      }

      // Add comment
      card.comments.push({
        sender: {
          user: user.id,
          name: user.name,
          color: user.color,
        },
        text: body.text,
        date: new Date(),
      });

      await card.save();

      const cardJson = await card.toJSON();
      return await { ...cardJson, boardTitle: board.title };
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateComment(
    cardId: string,
    boardId: string,
    commentId: string,
    user: User,
    body: any,
  ): Promise<Card> {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to update this card');
      }

      // Update card
      const comment = card.comments.find(
        (comment) =>
          comment._id.toString() === commentId &&
          comment.sender.user.toString() == user._id.toString(),
      );

      if (comment) {
        card.comments = card.comments.map((comment) => {
          if (comment._id.toString() === commentId) {
            comment.text = body.text;
          }
          return comment;
        });
      } else {
        throw new Error('You dont have permission to update this comment');
      }
      await card.save();

      // Add to board activity
      this.activityModel.create({
        board: boardId,
        card: new ObjectId(cardId),
        user: new ObjectId(user.id),
        text: body.text,
        color: user.color,
        userName: user.name,
        type: 'card.comment.update',
        cardTitle: card.title,
      });

      const cardJson = await card.toJSON();
      return { ...cardJson, boardTitle: board.title };
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteComment(
    cardId: string,
    boardId: string,
    commentId: string,
    user: User,
  ): Promise<Card> {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to update this card');
      }

      // Delete card
      const comment = card.comments.find(
        (comment) =>
          comment._id.toString() === commentId &&
          comment.sender.user.toString() === user.id.toString(),
      );
      if (comment) {
        card.comments = card.comments.filter(
          (comment) => comment._id.toString() !== commentId,
        );
        await card.save();
      } else {
        throw new Error('You dont have permission to delete this comment');
      }

      this.activityModel.create({
        board: boardId,
        card: new ObjectId(cardId),
        user: user.id,
        text: `deleted his/her own comment in card`,
        color: user.color,
        userName: user.name,
        type: 'card.comment.delete',
        cardTitle: card.title,
      });

      return card.toJSON();
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async addMember(
    cardId: string,
    boardId: string,
    user: User,
    memberId: string,
  ): Promise<Card> {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });
      const member = await this.userModel.findById(memberId);

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to add member this card');
      }

      // Add member
      card.members.unshift({
        user: member._id,
        name: member.name,
        color: member.color,
      });
      card.members = uniqBy(card.members, 'user');
      await card.save();

      this.activityModel.create({
        board: boardId,
        card: new ObjectId(cardId),
        list: card.owner,
        user: user.id,
        text: `added '${member.name}' to card`,
        color: user.color,
        userName: user.name,
        type: 'card.member.add',
        cardTitle: card.title,
      });

      const jsonCard = await card.toJSON();

      return { ...jsonCard, boardTitle: board.title };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async deleteMember(
    cardId: string,
    boardId: string,
    user: User,
    memberId: string,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to add member this card');
      }

      // Delete member
      card.members = uniqBy(
        card.members.filter((a) => a.user.toString() !== memberId.toString()),
        'user',
      );
      await card.save();

      // Get member
      const tempMember = await this.userModel.findById(memberId);

      this.activityModel.create({
        board: boardId,
        card: new ObjectId(cardId),
        list: card.owner,
        user: user.id,
        text: `removed '${tempMember.name}' from ${card.title}`,
        color: user.color,
        userName: user.name,
        type: 'card.member.delete',
        cardTitle: card.title,
      });

      return card.toJSON();
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async createLabel(cardId, boardId, user, label: Label) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
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

  async updateLabel(cardId, boardId, labelId, user, label) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
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

  async deleteLabel(cardId, boardId, labelId, user) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
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

  async updateLabelSelection(cardId, boardId, labelId, user, selected) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });
      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
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
  async createChecklist(cardId, boardId, user, title) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });
      const loggedInUser = await this.userModel.findById(user.id);
      // Validate owner
      const validate = await validateCardOwners(
        card,
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

      return { checklistId: checklistId };
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteChecklist(cardId, boardId, checklistId, user) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
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

      return { message: 'Success!' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async addChecklistItem(
    cardId: string,
    boardId: string,
    user: User,
    checklistId: string,
    text: string,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
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
    boardId: string,
    user: User,
    checklistId: string,
    checklistItemId: string,
    completed: boolean,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
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

      // Add card activity
      this.activityModel.create({
        board: boardId,
        card: new ObjectId(cardId),
        user: new ObjectId(user.id),
        text: completed
          ? `marked ${clItem} as completed on card`
          : `marked ${clItem} as uncompleted on card`,
        color: user.color,
        userName: user.name,
        type: 'card.checklist.update',
        cardTitle: card.title,
      });

      return card.checklists;
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async setChecklistItemText(
    cardId,
    boardId,
    user,
    checklistId,
    checklistItemId,
    text,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
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
    boardId: string,
    user: User,
    checklistId: string,
    checklistItemId: string,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
      if (!validate) {
        throw new Error(
          'You dont have permission to delete this checklist item',
        );
      }
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
      // add card activity
      this.activityModel.create({
        board: boardId,
        card: new ObjectId(cardId),
        user: new ObjectId(user.id),
        text: `deleted checklist item on card`,
        color: user.color,
        userName: user.name,
        type: 'card.checklist.update',
        cardTitle: card.title,
      });

      return card.checklists;
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async updateStartDueDates(
    cardId: string,
    boardId: string,
    user: User,
    startDate: Date,
    dueDate: Date,
    dueTime: string,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to update date of this card');
      }

      // Update dates
      card.date.startDate = startDate;
      card.date.dueDate = dueDate;
      card.date.dueTime = dueTime;
      if (dueDate === null) card.date.completed = false;
      await card.save();
      return await card.toJSON();
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async updateDateCompleted(
    cardId: string,
    boardId: string,
    user: User,
    completed: boolean,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
      if (!validate) {
        throw new Error(
          "You don't have permission to update the date of this card",
        );
      }

      // Update date completed event
      card.date.completed = completed;

      await card.save();

      // Add to board activity
      this.activityModel.create({
        board: boardId,
        card: new ObjectId(cardId),
        user: new ObjectId(user.id),
        text: completed
          ? `marked as completed on card`
          : `update due date on card`,
        color: user.color,
        userName: user.name,
        type: 'card.dueDate',
        cardTitle: card.title,
      });

      return await card.date;
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async addAttachment(
    cardId: string,
    boardId: string,
    user: User,
    link: string,
    name: string,
    uploadData?: any,
  ): Promise<Card> {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to update date of this card');
      }

      //Add attachment
      const validLink = new RegExp(/^https?:\/\//).test(link)
        ? link
        : 'http://' + link;

      const attachment: Attachment = {
        link: validLink,
        name: name,
      };

      let cover = undefined;

      if (!uploadData) {
        let metadata = null;
        try {
          metadata = await urlMetadata(validLink);
        } catch (e) {}

        if (metadata) {
          attachment.name = metadata.title;
          attachment.thumbnail = getThumbnailFromMeta(metadata);
        }
      } else {
        attachment.isInternal = true;
        attachment.mineType = uploadData.ContentType;
        attachment.metadata = {
          Bucket: uploadData.Bucket,
          Key: uploadData.Key,
          ETag: uploadData.ETag,
        };
        attachment.fileType = getFileCategory(uploadData.ContentType);
        if (attachment.fileType === 'image') {
          attachment.thumbnail = uploadData.thumbnail.Location;
          attachment.metadata.thumbnail = {
            Bucket: uploadData.thumbnail.Bucket,
            Key: uploadData.thumbnail.Key,
            ETag: uploadData.thumbnail.ETag,
          };

          if (!card.cover.thumbnail) {
            if (!card.cover) {
              card.cover = {
                color: '',
                isSizeOne: true,
              };
            }
            card.cover.thumbnail = uploadData.thumbnail.Location;
            card.cover.isSizeOne = true;
            cover = card.cover;
          }
        }
      }

      if (!card.attachments) {
        card.attachments = [];
      }
      card.attachments.push(attachment);
      await card.save();

      //Add to board activity
      // board.activity.unshift({
      //   user: user._id,
      //   name: user.name,
      //   action: `attached ${validLink} to ${card.title}`,
      //   color: user.color,
      // });
      const cardJson = await card.toJSON();
      return { ...cardJson, boardTitle: board.title };
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteAttachment(
    cardId: string,
    boardId: string,
    user: User,
    attachmentId: string,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
      if (!validate) {
        throw new Error('You dont have permission to delete this attachment');
      }

      let attachmentObj = card.attachments?.find(
        (attachment) => attachment._id.toString() === attachmentId.toString(),
      );

      //Delete checklistItem
      card.attachments = card.attachments?.filter(
        (attachment) => attachment._id.toString() !== attachmentId.toString(),
      );
      await card.save();
      if (attachmentObj?.isInternal) {
        this.SpacesService.deleteFile(attachmentObj.metadata.Key).catch((e) => {
          console.log(e);
        });

        if (attachmentObj.metadata.thumbnail) {
          this.SpacesService.deleteFile(
            attachmentObj.metadata.thumbnail.Key,
          ).catch((e) => {
            console.log(e);
          });
        }

        if (card.cover?.thumbnail === attachmentObj.thumbnail) {
          card.cover = undefined;
          await card.save();
        }
      }

      return await card.toJSON();
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async updateAttachment(
    cardId: string,
    boardId: string,
    user: User,
    attachmentId: string,
    link: string,
    name: string,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
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
    boardId: string,
    user: User,
    color: string,
    isSizeOne: boolean,
    thumbnail: string = null,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });

      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
      if (!validate) {
        throw new Error(
          'You dont have permission to update attachment of this card',
        );
      }

      //Update date cover color

      card.cover.isSizeOne = isSizeOne;
      if (thumbnail) {
        card.cover.thumbnail = thumbnail;
      }

      if (color) {
        card.cover.color = color;
      }

      await card.save();
      return { message: 'Success!' };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async estimateTime(
    cardId: string,
    boardId: string,
    user: User,
    astimatedTime: number,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });
      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
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
        board: boardId,
        card: new ObjectId(cardId),
        list: card.owner,
        user: new ObjectId(user._id),
        text: `estimated time as ${secondsToTimeString(astimatedTime)} hours`,
        color: user.color,
        userName: user.name,
        type: 'card.timeTracking.estimate',
        cardTitle: card.title,
      });

      return card.timeTracking;
    } catch (error) {
      throw new Error(error);
    }
  }

  async addTimeTracking(
    cardId: string,
    boardId: string,
    user: User,
    time: number,
    comment: string,
    date: Date,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });
      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
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
      const board = await this.boardModel.findOne({ shortId: boardId });
      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
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
    boardId: string,
    timeTrackingId: string,
    user: User,
  ) {
    try {
      // Get models
      const card = await this.cardModel.findById(cardId);
      const board = await this.boardModel.findOne({ shortId: boardId });
      // Validate owner
      const validate = await validateCardOwners(card, board, user, false);
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

  async getCardActivities(cardId: string) {
    return await this.activityModel.find({
      card: new ObjectId(cardId),
    });
  }
}
