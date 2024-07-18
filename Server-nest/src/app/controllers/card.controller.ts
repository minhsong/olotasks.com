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
import { CardService } from '../services/card.service';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateCardDto } from '../models/dto/card/card.create';
import { UserService } from '../services/user.service';
import { Response } from 'express';
import { SpacesService } from '../services/spaces.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { WsGateway } from '../websocket/ws.gateway';
import * as sharp from 'sharp';
import { getFileCategory } from 'src/utils/helperMethods';

@Controller('card')
@Roles([])
export class cardController {
  constructor(
    private readonly cardService: CardService,
    private readonly userService: UserService,
    private readonly spaceService: SpacesService,
    private readonly wsGateway: WsGateway,
  ) {}

  @Delete(':cardId')
  @Roles([])
  async deleteCard(@Param() params, @Req() req) {
    const { boardId, cardId } = params;
    const user = req.user;
    const loggedInUser = await this.userService.getUser(user.id);

    // Call the card service
    return await this.cardService
      .deleteById(cardId, boardId, loggedInUser)
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
    const { color, isSizeOne } = body;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .updateCover(cardId, boardId, loggedInUser, color, isSizeOne)
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .updateAttachment(cardId, boardId, loggedInUser, attachmentId, link, name)
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .deleteAttachment(cardId, boardId, loggedInUser, attachmentId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('/:boardId/:cardId/add-attachment')
  @Roles([])
  async addAttachment(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId } = params;
    const { link, name } = body;
    const loggedInUser = await this.userService.getUser(user.id);

    // Call the card service
    return await this.cardService
      .addAttachment(cardId, boardId, loggedInUser, link, name)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put('/:boardId/:cardId/update-dates')
  @Roles([])
  async updateDates(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId } = params;
    const { startDate, dueDate, dueTime } = body;
    const loggedInUser = await this.userService.getUser(user.id);

    // Call the card service
    return await this.cardService
      .updateStartDueDates(
        cardId,
        boardId,
        loggedInUser,
        startDate,
        dueDate,
        dueTime,
      )
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put('/:boardId/:cardId/update-date-completed')
  @Roles([])
  async updateDateCompleted(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId } = params;
    const { completed } = body;
    const loggedInUser = await this.userService.getUser(user.id);

    // Call the card service
    return await this.cardService
      .updateDateCompleted(cardId, boardId, loggedInUser, completed)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Delete(
    '/:boardId/:cardId/:checklistId/:checklistItemId/delete-checklist-item',
  )
  @Roles([])
  async deleteChecklistItem(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, checklistId, checklistItemId } = params;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .deleteChecklistItem(
        cardId,
        boardId,
        loggedInUser,
        checklistId,
        checklistItemId,
      )
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .setChecklistItemText(
        cardId,
        boardId,
        loggedInUser,
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .setChecklistItemCompleted(
        cardId,
        boardId,
        loggedInUser,
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .addChecklistItem(cardId, boardId, loggedInUser, checklistId, text)
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .deleteChecklist(cardId, boardId, checklistId, loggedInUser)
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .createChecklist(cardId, boardId, loggedInUser, title)
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .updateLabelSelection(cardId, boardId, labelId, loggedInUser, selected)
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .deleteLabel(cardId, boardId, labelId, loggedInUser)
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .updateLabel(cardId, boardId, labelId, loggedInUser, label)
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .createLabel(cardId, boardId, loggedInUser, label)
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .addMember(cardId, boardId, loggedInUser, memberId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Delete('/:boardId/:cardId/:memberId/delete-member')
  @Roles([])
  async deleteMember(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, memberId } = params;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .deleteMember(cardId, boardId, loggedInUser, memberId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
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

    const loggedInUser = await this.userService.getUser(user.id);
    //Call the card service
    return await this.cardService
      .create(title, listId, boardId, loggedInUser)
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .getCard(cardId, boardId, loggedInUser)
      .then((result) => {
        return res.status(HttpStatus.CREATED).send(result);
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put('/:boardId/:cardId')
  @Roles([])
  async update(@Param() params, @Req() req, @Body() body) {
    // Get params
    const { boardId, cardId } = params;
    const loggedInUser = await this.userService.getUser(req.user.id);
    // Call the card service
    return await this.cardService
      .update(cardId, boardId, loggedInUser, body)
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .deleteById(cardId, boardId, loggedInUser)
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .addComment(cardId, boardId, loggedInUser, body)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put('/:boardId/:cardId/:commentId')
  @Roles([])
  async updateComment(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, commentId } = params;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .updateComment(cardId, boardId, commentId, loggedInUser, body)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Delete('/:boardId/:cardId/:commentId')
  @Roles([])
  async deleteComment(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId, commentId } = params;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .deleteComment(cardId, boardId, commentId, loggedInUser)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('/:boardId/:cardId/estimate-time')
  @Roles([])
  async estimateTime(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, cardId } = params;
    const { time } = body;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .estimateTime(cardId, boardId, loggedInUser, time)
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .addTimeTracking(cardId, boardId, loggedInUser, time, comment, date)
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .updateTimeTracking(
        cardId,
        boardId,
        timeId,
        loggedInUser,
        time,
        comment,
        date,
      )
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
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .deleteTimeTracking(cardId, boardId, timeId, loggedInUser)
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
    @UploadedFile() file: Express.Multer.File,
    @Param() params,
    @Req() req,
  ) {
    // Get params
    const user = req.user;
    const { boardId, cardId } = params;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    const fileKey = `${boardId}/${cardId}/${file.originalname}`;
    try {
      let fileData = await this.spaceService.uploadFile(file, fileKey);
      if (getFileCategory(file.mimetype) === 'image') {
        const thumbnailBuffer = await sharp(file.buffer)
          .resize({ width: 150 })
          .toBuffer();

        const thumbnailKey = `${boardId}/${cardId}/thumbnails-${file.originalname}`;
        const thumbnailData = await this.spaceService.uploadFileFromBuffer(
          thumbnailBuffer,
          thumbnailKey,
          file.mimetype,
        );
        fileData = { ...fileData, thumbnail: thumbnailData };
      }
      const attached = await this.cardService.addAttachment(
        cardId,
        boardId,
        loggedInUser,
        fileData.Location,
        file.originalname,
        fileData,
      );

      return {
        data: attached,
        boardId,
        cardId,
      };
    } catch (err) {
      throw err;
    }
  }
}
