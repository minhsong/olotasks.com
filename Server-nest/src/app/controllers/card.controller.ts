import {
  Controller,
  Delete,
  Put,
  Post,
  Get,
  Param,
  Body,
  Req,
  Res,
  HttpStatus,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { CardService } from '../services/card.service';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateCardDto } from '../models/dto/card/card.create';
import { UserService } from '../services/user.service';
import { Response } from 'express';
import { SpacesService } from '../services/spaces.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { WsGateway } from '../websocket/ws.gateway';
import * as sharp from 'sharp';
import { exportWatchers, getFileCategory } from 'src/utils/helperMethods';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../models/schemas/notification.schema';
import { User } from '../models/schemas/user.shema';

@Controller('card')
@Roles([])
export class cardController {
  constructor(
    private readonly cardService: CardService,
    private readonly userService: UserService,
    private readonly spaceService: SpacesService,
    private readonly notificationService: NotificationService,
    private readonly wsGateway: WsGateway,
  ) {}

  @Get('/fix-card-comment')
  @Roles([])
  async fixCardComment() {
    return await this.cardService.fixCardComment();
  }

  @Delete(':cardId')
  @Roles([])
  async deleteCard(@Param() params, @Req() req) {
    const { boardId, cardId } = params;

    // Call the card service
    return await this.cardService
      .deleteById(cardId, boardId, req.user)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put('/:boardId/:cardId/update-cover')
  @Roles([])
  async updateCover(@Param() params, @Req() req, @Body() body) {
    const user = req.user;
    const { boardId, cardId } = params;
    const { color, isSizeOne, thumbnail } = body;
    // Call the card service
    return await this.cardService
      .updateCover(cardId, boardId, user, color, isSizeOne, thumbnail)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put('/:boardId/:cardId/:attachmentId/update-attachment')
  @Roles([])
  async updateAttachment(@Param() params, @Req() req, @Body() body) {
    const user = req.user;
    const { boardId, cardId, attachmentId } = params;
    const { link, name } = body;
    // Call the card service
    return await this.cardService
      .updateAttachment(cardId, boardId, user, attachmentId, link, name)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Delete('/:boardId/:cardId/:attachmentId/delete-attachment')
  @Roles([])
  async deleteAttachment(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, attachmentId } = params;
    // Call the card service
    const card = await this.cardService
      .deleteAttachment(cardId, boardId, user, attachmentId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });

    return card.attachments;
  }

  @Post('/:boardId/:cardId/add-attachment')
  @Roles([])
  async addAttachment(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId } = params;
    const { link, name } = body;

    // Call the card service
    const card = await this.cardService
      .addAttachment(cardId, boardId, user, link, name)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });

    // create notifications for the watchers
    const watchedUsers = exportWatchers(card).filter((id) => id !== user.id);
    const notifications: Notification[] = watchedUsers.map((watcher) => {
      return {
        user: new ObjectId(watcher),
        sender: {
          id: user._id,
          name: user.name,
          color: user.color,
          avatar: user.avatar,
        },
        text: `added an attachment to the card`,
        board: { id: boardId, name: card.boardTitle },
        card: { id: new ObjectId(cardId), name: card.title },
        type: 'card.attachment.add',
      };
    });

    // send notification to the watchers
    this.notificationService
      .createNotifications(notifications)
      .then((notis) => {
        notis.forEach((noti) => {
          this.wsGateway.sendMessageToUser(noti.user.toString(), noti.type, {
            notification: noti,
            attachments: card.attachments,
          });
        });
      });

    return { attachments: card.attachments, cover: card.cover };
  }

  @Put('/:boardId/:cardId/update-dates')
  @Roles([])
  async updateDates(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId } = params;
    const { startDate, dueDate, dueTime } = body;

    // Call the card service
    const card = await this.cardService
      .updateStartDueDates(cardId, boardId, user, startDate, dueDate, dueTime)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });

    return card.members;
  }

  @Put('/:boardId/:cardId/update-date-completed')
  @Roles([])
  async updateDateCompleted(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId } = params;
    const { completed } = body;

    // Call the card service
    const date = await this.cardService
      .updateDateCompleted(cardId, boardId, user, completed)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });

    return date;
  }

  @Delete(
    '/:boardId/:cardId/:checklistId/:checklistItemId/delete-checklist-item',
  )
  @Roles([])
  async deleteChecklistItem(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, checklistId, checklistItemId } = params;
    // Call the card service
    return await this.cardService
      .deleteChecklistItem(cardId, boardId, user, checklistId, checklistItemId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put(
    '/:boardId/:cardId/:checklistId/:checklistItemId/set-checklist-item-text',
  )
  @Roles([])
  async setChecklistItemText(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, checklistId, checklistItemId } = params;
    const text = body.text;
    // Call the card service
    return await this.cardService
      .setChecklistItemText(
        cardId,
        boardId,
        user,
        checklistId,
        checklistItemId,
        text,
      )
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put(
    '/:boardId/:cardId/:checklistId/:checklistItemId/set-checklist-item-completed',
  )
  @Roles([])
  async setChecklistItemCompleted(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, checklistId, checklistItemId } = req.params;
    const completed = req.body.completed;
    // Call the card service
    return await this.cardService
      .setChecklistItemCompleted(
        cardId,
        boardId,
        user,
        checklistId,
        checklistItemId,
        completed,
      )
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('/:boardId/:cardId/:checklistId/add-checklist-item')
  async addChecklistItem(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, checklistId } = params;
    const text = body.text;
    // Call the card service
    return await this.cardService
      .addChecklistItem(cardId, boardId, user, checklistId, text)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Delete('/:boardId/:cardId/:checklistId/delete-checklist')
  @Roles([])
  async deleteChecklist(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, checklistId } = params;
    // Call the card service
    return await this.cardService
      .deleteChecklist(cardId, boardId, checklistId, user)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('/:boardId/:cardId/create-checklist')
  @Roles([])
  async createChecklist(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId } = params;
    const title = body.title;
    // Call the card service
    return await this.cardService
      .createChecklist(cardId, boardId, user, title)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put('/:boardId/:cardId/:labelId/update-label-selection')
  @Roles([])
  async updateLabelSelection(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, labelId } = params;
    const { selected } = body;
    // Call the card service
    return await this.cardService
      .updateLabelSelection(cardId, boardId, labelId, user, selected)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Delete('/:boardId/:cardId/:labelId/delete-label')
  @Roles([])
  async deleteLabel(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, labelId } = params;
    // Call the card service
    return await this.cardService
      .deleteLabel(cardId, boardId, labelId, user)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put('/:boardId/:cardId/:labelId/update-label')
  @Roles([])
  async updateLabel(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, labelId } = params;
    const label = body;
    // Call the card service
    return await this.cardService
      .updateLabel(cardId, boardId, labelId, user, label)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('/:boardId/:cardId/create-label')
  @Roles([])
  async createLabel(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId } = params;
    const label = body;
    // Call the card service
    return await this.cardService
      .createLabel(cardId, boardId, user, label)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('/:boardId/:cardId/add-member')
  @Roles([])
  async addMember(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId } = params;
    const { memberId } = body;
    // Call the card service
    const card = await this.cardService
      .addMember(cardId, boardId, user, memberId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });

    // create notifications for added member
    const addedUser = card.members.find(
      (member) => member.user.toString() === memberId,
    );
    const notifications: Notification[] = [
      {
        user: new ObjectId(memberId),
        sender: {
          id: user._id,
          name: user.name,
          color: user.color,
          avatar: user.avatar,
        },
        text: `added you to a card`,
        board: { id: boardId, name: card.boardTitle },
        card: { id: new ObjectId(cardId), name: card.title },
        type: 'card.member.add',
      },
    ];

    this.notificationService
      .createNotifications(notifications)
      .then((notis) => {
        notis.forEach((noti) => {
          this.wsGateway.sendMessageToUser(noti.user.toString(), noti.type, {
            notification: noti,
            members: card.members,
          });
        });
      });

    return card.members;
  }

  @Delete('/:boardId/:cardId/:memberId/delete-member')
  @Roles([])
  async deleteMember(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, memberId } = params;
    // Call the card service
    const card = await this.cardService
      .deleteMember(cardId, boardId, user, memberId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });

    // create notifications for removed member
    const notifications: Notification[] = [
      {
        user: new ObjectId(memberId),
        sender: {
          id: user._id,
          name: user.name,
          color: user.color,
          avatar: user.avatar,
        },
        text: `removed you from a card`,
        board: { id: boardId, name: card.boardTitle },
        card: { id: new ObjectId(cardId), name: card.title },
        type: 'card.member.delete',
      },
    ];

    this.notificationService
      .createNotifications(notifications)
      .then((notis) => {
        notis.forEach((noti) => {
          this.wsGateway.sendMessageToUser(noti.user.toString(), noti.type, {
            notification: noti,
            members: card.members,
          });
        });
      });

    return card.members;
  }

  @Post('create')
  @Roles([])
  async create(
    @Param() params,
    @Req() req,
    @Body() body: CreateCardDto,
    @Res() res: Response,
  ) {
    // Deconstruct the params
    const { title, listId, boardId } = body;
    const user = req.user;

    // Validate the inputs
    if (!(title && listId && boardId))
      return res.status(400).send({
        errMessage:
          'The create operation could not be completed because there is missing information',
      });

    //Call the card service
    return await this.cardService
      .create(title, listId, boardId, user)
      .then((result) => {
        return res.status(HttpStatus.CREATED).send(result);
      })
      .catch((err) => {
        throw err;
      });
  }

  @Get('/:boardId/:cardId')
  @Roles([])
  async getCard(
    @Param() params,
    @Req() req,
    @Body() body,
    @Res() res: Response,
  ) {
    // Get params
    const user = req.user;

    const { boardId, cardId } = params;
    // Call the card service
    return await this.cardService
      .getCard(cardId, boardId, user)
      .then((result) => {
        return res.status(HttpStatus.CREATED).send(result);
      })
      .catch((err) => {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ errMessage: err.message });
      });
  }

  @Put('/:boardId/:cardId')
  @Roles([])
  async update(@Param() params, @Req() req, @Body() body) {
    // Get params
    const { boardId, cardId } = params;
    const user = req.user as User;
    // Call the card service
    return await this.cardService
      .update(cardId, boardId, user, body)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Delete('/:boardId/:cardId/delete-card')
  @Roles([])
  async delete(@Param() params, @Req() req) {
    // Get params
    const user = req.user;
    const { boardId, cardId } = params;
    // Call the card service
    return await this.cardService
      .deleteById(cardId, boardId, user)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('/:boardId/:cardId/add-comment')
  @Roles([])
  async addComment(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId } = params;
    // Call the card service
    const card = await this.cardService
      .addComment(cardId, boardId, user, body)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
    // create notifications for the watchers

    const mentionedUsers = (body.mentions || []).map((mention) => mention.id);
    const watchedUsers = exportWatchers(card).filter(
      (id) => id !== user.id && !mentionedUsers.includes(id),
    );
    const notifications: Notification[] = watchedUsers.map((watcher) => {
      return {
        user: new ObjectId(watcher),
        sender: {
          id: user._id,
          name: user.name,
          color: user.color,
          avatar: user.avatar,
        },
        text: `added an comment to the card`,
        board: { id: boardId, name: card.boardTitle },
        card: { id: new ObjectId(cardId), name: card.title },
        type: 'card.comment.add',
      };
    });

    const mentionedNotifications: Notification[] = mentionedUsers.map(
      (mention) => {
        return {
          user: new ObjectId(mention),
          sender: {
            id: user._id,
            name: user.name,
            color: user.color,
            avatar: user.avatar,
          },
          text: `mentioned you in a comment`,
          board: { id: boardId, name: card.boardTitle },
          card: { id: new ObjectId(cardId), name: card.title },
          type: 'card.comment.add',
        };
      },
    );

    // send notification to the watchers
    this.notificationService
      .createNotifications([...notifications, ...mentionedNotifications])
      .then((notis) => {
        notis.forEach((noti) => {
          this.wsGateway.sendMessageToUser(noti.user.toString(), noti.type, {
            notification: noti,
            comments: card.comments,
          });
        });
      });

    return card.comments;
  }

  @Put('/:boardId/:cardId/:commentId')
  @Roles([])
  async updateComment(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, commentId } = params;
    // Call the card service
    const card = await this.cardService
      .updateComment(cardId, boardId, commentId, user, body)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
    const mentionedUsers = (body.mentions || []).map((mention) => mention.id);
    const mentionedNotifications: Notification[] = mentionedUsers.map(
      (mention) => {
        return {
          user: new ObjectId(mention),
          sender: {
            id: user._id,
            name: user.name,
            color: user.color,
            avatar: user.avatar,
          },
          text: `mentioned you in a comment`,
          board: { id: boardId, name: card.boardTitle },
          card: { id: new ObjectId(cardId), name: card.title },
          type: 'card.comment.update',
        };
      },
    );

    // send notification to the watchers
    this.notificationService
      .createNotifications(mentionedNotifications)
      .then((notis) => {
        notis.forEach((noti) => {
          this.wsGateway.sendMessageToUser(noti.user.toString(), noti.type, {
            notification: noti,
            comments: card.comments,
          });
        });
      });
    return card.comments;
  }

  @Delete('/:boardId/:cardId/:commentId')
  @Roles([])
  async deleteComment(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, commentId } = params;
    // Call the card service
    const card = await this.cardService
      .deleteComment(cardId, boardId, commentId, user)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });

    return card.comments;
  }

  @Post('/:boardId/:cardId/estimate-time')
  @Roles([])
  async estimateTime(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId } = params;
    const { time } = body;
    // Call the card service
    return await this.cardService
      .estimateTime(cardId, boardId, user, time)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('/:boardId/:cardId/add-time')
  @Roles([])
  async addTime(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId } = params;
    const { time, comment, date } = body;
    // Call the card service
    return await this.cardService
      .addTimeTracking(cardId, boardId, user, time, comment, date)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put('/:boardId/:cardId/:timeId/update-time')
  @Roles([])
  async updateTime(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, timeId } = params;
    const { time, comment, date } = body;
    // Call the card service
    return await this.cardService
      .updateTimeTracking(cardId, boardId, timeId, user, time, comment, date)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Delete('/:boardId/:cardId/:timeId/delete-time')
  @Roles([])
  async deleteTime(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, timeId } = params;
    // Call the card service
    return await this.cardService
      .deleteTimeTracking(cardId, boardId, timeId, user)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('/:boardId/:cardId/upload-files')
  @UseInterceptors(FileInterceptor('file'))
  @Roles([])
  async uploadAttachmentFile(
    @UploadedFile() file: any,
    @Param() params,
    @Req() req,
  ) {
    // Get params
    const user = req.user as User;
    const { boardId, cardId } = params;
    // Call the card service
    const fileKey = `${boardId}/${cardId}/${file.originalname}`;
    try {
      let fileData = await this.spaceService.uploadFile(file, fileKey);
      if (getFileCategory(file.mimetype) === 'image') {
        const thumbnailBuffer = await sharp(file.buffer)
          .resize({ width: 220 })
          .toBuffer();

        const thumbnailKey = `${boardId}/${cardId}/thumbnails-${file.originalname}`;
        const thumbnailData = await this.spaceService.uploadFileFromBuffer(
          thumbnailBuffer,
          thumbnailKey,
          file.mimetype,
        );
        fileData = { ...fileData, thumbnail: thumbnailData };
      }
      const card = await this.cardService.addAttachment(
        cardId,
        boardId,
        user,
        fileData.Location,
        file.originalname,
        fileData,
      );

      // create notifications for the watchers
      const watchedUsers = exportWatchers(card).filter(
        (id) => id !== user._id.toString(),
      );
      const notifications: Notification[] = watchedUsers.map((watcher) => {
        return {
          user: new ObjectId(watcher),
          sender: {
            id: user._id,
            name: user.name,
            color: user.color,
            avatar: user.avatar,
          },
          text: `added an attachment to the card`,
          board: { id: boardId, name: card.boardTitle },
          card: { id: new ObjectId(cardId), name: card.title },
          type: 'card.attachment.add',
        };
      });

      // send notification to the watchers
      this.notificationService
        .createNotifications(notifications)
        .then((notis) => {
          notis.forEach((noti) => {
            this.wsGateway.sendMessageToUser(noti.user.toString(), noti.type, {
              notification: noti,
              attachments: card.attachments,
            });
          });
        });

      return {
        data: card,
        boardId,
        cardId,
      };
    } catch (err) {
      throw err;
    }
  }

  @Get('/:boardId/:cardId/card-activities')
  @Roles([])
  async getCardActivities(@Param() params, @Req() req) {
    const user = req.user as User;
    const { cardId } = params;
    return this.cardService.getCardActivities(cardId).catch((err) => {
      return [];
    });
  }
}
