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
} from '@nestjs/common';
import { CardService } from '../services/card.service';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateCardDto } from '../models/dto/card/card.create';
import { UserService } from '../services/user.service';
import { Response } from 'express';

@Controller('card')
@Roles([])
export class cardController {
  constructor(
    private readonly cardService: CardService,
    private readonly userService: UserService,
  ) {}

  @Delete(':cardId')
  @Roles([])
  async deleteCard(@Param() params, @Req() req) {
    const { boardId, listId, cardId } = params;
    const user = req.user;
    const loggedInUser = await this.userService.getUser(user.id);

    // Call the card service
    return await this.cardService
      .deleteById(cardId, listId, boardId, loggedInUser)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put('/:boardId/:listId/:cardId/update-cover')
  @Roles([])
  async updateCover(@Param() params, @Req() req, @Body() body) {
    const user = req.user;
    const { boardId, listId, cardId } = params;
    const { color, isSizeOne } = body;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .updateCover(cardId, listId, boardId, loggedInUser, color, isSizeOne)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put('/:boardId/:listId/:cardId/:attachmentId/update-attachment')
  @Roles([])
  async updateAttachment(@Param() params, @Req() req, @Body() body) {
    const user = req.user;
    const { boardId, listId, cardId, attachmentId } = params;
    const { link, name } = body;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .updateAttachment(
        cardId,
        listId,
        boardId,
        loggedInUser,
        attachmentId,
        link,
        name,
      )
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Delete('/:boardId/:listId/:cardId/:attachmentId/delete-attachment')
  @Roles([])
  async deleteAttachment(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId, attachmentId } = params;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .deleteAttachment(cardId, listId, boardId, loggedInUser, attachmentId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('/:boardId/:listId/:cardId/add-attachment')
  @Roles([])
  async addAttachment(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId } = params;
    const { link, name } = body;
    const loggedInUser = await this.userService.getUser(user.id);

    // Call the card service
    return await this.cardService
      .addAttachment(cardId, listId, boardId, loggedInUser, link, name)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put('/:boardId/:listId/:cardId/update-dates')
  @Roles([])
  async updateDates(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId } = params;
    const { startDate, dueDate, dueTime } = body;
    const loggedInUser = await this.userService.getUser(user.id);

    // Call the card service
    return await this.cardService
      .updateStartDueDates(
        cardId,
        listId,
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

  @Put('/:boardId/:listId/:cardId/update-date-completed')
  @Roles([])
  async updateDateCompleted(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId } = params;
    const { completed } = body;
    const loggedInUser = await this.userService.getUser(user.id);

    // Call the card service
    return await this.cardService
      .updateDateCompleted(cardId, listId, boardId, loggedInUser, completed)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Delete(
    '/:boardId/:listId/:cardId/:checklistId/:checklistItemId/delete-checklist-item',
  )
  @Roles([])
  async deleteChecklistItem(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId, checklistId, checklistItemId } = params;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .deleteChecklistItem(
        cardId,
        listId,
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
    '/:boardId/:listId/:cardId/:checklistId/:checklistItemId/set-checklist-item-text',
  )
  @Roles([])
  async setChecklistItemText(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId, checklistId, checklistItemId } = params;
    const text = body.text;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .setChecklistItemText(
        cardId,
        listId,
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
    '/:boardId/:listId/:cardId/:checklistId/:checklistItemId/set-checklist-item-completed',
  )
  @Roles([])
  async setChecklistItemCompleted(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId, checklistId, checklistItemId } =
      req.params;
    const completed = req.body.completed;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .setChecklistItemCompleted(
        cardId,
        listId,
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

  @Post('/:boardId/:listId/:cardId/:checklistId/add-checklist-item')
  async addChecklistItem(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId, checklistId } = params;
    const text = body.text;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .addChecklistItem(
        cardId,
        listId,
        boardId,
        loggedInUser,
        checklistId,
        text,
      )
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Delete('/:boardId/:listId/:cardId/:checklistId/delete-checklist')
  @Roles([])
  async deleteChecklist(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId, checklistId } = params;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .deleteChecklist(cardId, listId, boardId, checklistId, loggedInUser)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('/:boardId/:listId/:cardId/create-checklist')
  @Roles([])
  async createChecklist(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId } = params;
    const title = body.title;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .createChecklist(cardId, listId, boardId, loggedInUser, title)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put('/:boardId/:listId/:cardId/:labelId/update-label-selection')
  @Roles([])
  async updateLabelSelection(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId, labelId } = params;
    const { selected } = body;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .updateLabelSelection(
        cardId,
        listId,
        boardId,
        labelId,
        loggedInUser,
        selected,
      )
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Delete('/:boardId/:listId/:cardId/:labelId/delete-label')
  @Roles([])
  async deleteLabel(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId, labelId } = params;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .deleteLabel(cardId, listId, boardId, labelId, loggedInUser)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put('/:boardId/:listId/:cardId/:labelId/update-label')
  @Roles([])
  async updateLabel(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId, labelId } = params;
    const label = body;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .updateLabel(cardId, listId, boardId, labelId, loggedInUser, label)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('/:boardId/:listId/:cardId/create-label')
  @Roles([])
  async createLabel(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId } = params;
    const label = body;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .createLabel(cardId, listId, boardId, loggedInUser, label)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('/:boardId/:listId/:cardId/add-member')
  @Roles([])
  async addMember(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId } = params;
    const { memberId } = body;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .addMember(cardId, listId, boardId, loggedInUser, memberId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Delete('/:boardId/:listId/:cardId/:memberId/delete-member')
  @Roles([])
  async deleteMember(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId, memberId } = params;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .deleteMember(cardId, listId, boardId, loggedInUser, memberId)
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

  @Get('/:boardId/:listId/:cardId')
  @Roles([])
  async getCard(
    @Param() params,
    @Req() req,
    @Body() body,
    @Res() res: Response,
  ) {
    // Get params
    const user = req.user;

    const { boardId, listId, cardId } = params;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .getCard(cardId, listId, boardId, loggedInUser)
      .then((result) => {
        return res.status(HttpStatus.CREATED).send(result);
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put('/:boardId/:listId/:cardId')
  @Roles([])
  async update(@Param() params, @Req() req, @Body() body) {
    // Get params
    const { boardId, listId, cardId } = params;
    const loggedInUser = await this.userService.getUser(req.user.id);
    // Call the card service
    return await this.cardService
      .update(cardId, listId, boardId, loggedInUser, body)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Delete('/:boardId/:listId/:cardId/delete-card')
  @Roles([])
  async delete(@Param() params, @Req() req) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId } = params;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .deleteById(cardId, listId, boardId, loggedInUser)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('/:boardId/:listId/:cardId/add-comment')
  @Roles([])
  async addComment(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId } = params;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .addComment(cardId, listId, boardId, loggedInUser, body)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Put('/:boardId/:listId/:cardId/:commentId')
  @Roles([])
  async updateComment(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId, commentId } = params;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .updateComment(cardId, listId, boardId, commentId, loggedInUser, body)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Delete('/:boardId/:listId/:cardId/:commentId')
  @Roles([])
  async deleteComment(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId, commentId } = params;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .deleteComment(cardId, listId, boardId, commentId, loggedInUser)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('/:boardId/:listId/:cardId/estimate-time')
  @Roles([])
  async estimateTime(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId } = params;
    const { time } = body;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .estimateTime(cardId, listId, boardId, loggedInUser, time)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('/:boardId/:listId/:cardId/add-time')
  @Roles([])
  async addTime(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId } = params;
    const { time, comment, date } = body;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .addTimeTracking(
        cardId,
        listId,
        boardId,
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

  @Put('/:boardId/:listId/:cardId/:timeId/update-time')
  @Roles([])
  async updateTime(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId, timeId } = params;
    const { time, comment, date } = body;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .updateTimeTracking(
        cardId,
        listId,
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

  @Delete('/:boardId/:listId/:cardId/:timeId/delete-time')
  @Roles([])
  async deleteTime(@Param() params, @Req() req, @Body() body) {
    // Get params
    const user = req.user;
    const { boardId, listId, cardId, timeId } = params;
    const loggedInUser = await this.userService.getUser(user.id);
    // Call the card service
    return await this.cardService
      .deleteTimeTracking(cardId, listId, boardId, timeId, loggedInUser)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }
}
