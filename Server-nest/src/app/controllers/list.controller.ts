import {
  Controller,
  Put,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  Res,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ListService } from '../services/list.service';
import { Roles } from 'src/decorators/roles.decorator';
import { Response } from 'express';
import { UserService } from '../services/user.service';
import { ObjectId } from 'mongodb';

@Controller('list')
export class ListRouteController {
  constructor(
    private readonly listservice: ListService,
    private readonly userService: UserService,
  ) {}

  @Roles([])
  @Put(':boardId/:listId/update-title')
  async updateListTitle(
    @Param('boardId') boardId: string,
    @Param('listId') listId: string,
    @Body() body: any,
    @Req() req: any,
    @Res() res: any,
  ) {
    // deconstruct the params
    const user = await this.userService.getUser(req.user.id);
    const { title } = body;

    // Validate the listId and boardId
    if (!(listId && boardId))
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ errMessage: 'List or board undefined' });

    return await this.listservice
      .updateListTitle(listId, boardId, user, title)
      .then((result) => {
        return res.status(HttpStatus.OK).send(result);
      })
      .catch((err) => {
        throw err;
      });
  }

  @Roles([])
  @Post('create')
  async create(@Body() body: any, @Req() req: any, @Res() res: Response) {
    // Deconstruct the body

    const { title, boardId } = body;
    // Validate the title
    if (!(title && boardId))
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ errMessage: 'Title cannot be empty' });
    const loggedUser = await this.userService.getUser(req.user.id);
    // Validate whether boardId is in the user's boards or not
    const validate = loggedUser.boards.filter((board) => board === boardId);
    if (!validate) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        errMessage:
          'You can not add a list to the board, you are not a member or owner!',
      });
    }
    // Call the service to add new list
    return await this.listservice
      .create(
        { title: title, owner: new ObjectId(boardId as string) },
        req.user,
      )
      .then((result) => {
        return res.status(HttpStatus.OK).send(result);
      })
      .catch((err) => {
        throw err;
      });
  }

  @Get(':boardId')
  async getAll(
    @Param('boardId') boardId: string,
    @Body() body: any,
    @Req() req: any,
    @Res() res: any,
  ) {
    // Assing parameter to constant
    // Validate whether boardId is in the user's board or not
    const loggedUser = await this.userService.getUser(req.user.id);
    if (!loggedUser) {
      throw new UnauthorizedException();
    }
    const validate = loggedUser.boards.filter(
      (board) => board.toString() === boardId,
    );
    if (!validate)
      return res.status(HttpStatus.BAD_REQUEST).send({
        errMessage:
          'You cannot get lists, because you are not owner of this lists!',
      });

    // Call the service to get all lists whose owner id matches the boardId
    return await this.listservice
      .getAll(boardId)
      .then((result) => {
        return res.status(HttpStatus.OK).send(result);
      })
      .catch((err) => {
        throw err;
      });
  }

  @Delete(':boardId/:listId')
  async deleteById(
    @Param('boardId') boardId: string,
    @Param('listId') listId: string,
    @Req() req: any,
    @Res() res: any,
  ) {
    // deconstruct the params
    const user = await this.userService.getUser(req.user.id);

    // Validate the listId and boardId
    if (!(listId && boardId))
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ errMessage: 'List or board undefined' });

    return await this.listservice
      .deleteById(listId, boardId, user)
      .then((result) => {
        return res.status(HttpStatus.OK).send(result);
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('change-card-order')
  async updateCardOrder(@Body() body: any, @Req() req: any, @Res() res: any) {
    // deconstruct the params
    const { boardId, sourceId, destinationId, destinationIndex, cardId } =
      req.body;
    const user = await this.userService.getUser(req.user.id);

    // Validate the params
    if (!(boardId && sourceId && destinationId && cardId))
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ errMessage: 'All parameters not provided' });

    // Validate the owner of board
    const validate = user.boards.filter((board) => board === boardId);
    if (!validate)
      return res
        .status(HttpStatus.FORBIDDEN)
        .send({ errMessage: 'You cannot edit the board that you hasnt' });

    // Call the service
    return await this.listservice
      .updateCardOrder(
        boardId,
        sourceId,
        destinationId,
        destinationIndex,
        cardId,
        user,
      )
      .then((result) => {
        return res.status(HttpStatus.OK).send(result);
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('change-list-order')
  async updateListOrder(@Body() body: any, @Req() req: any, @Res() res: any) {
    // deconstruct the params
    const { boardId, sourceIndex, destinationIndex, listId } = body;
    const user = await this.userService.getUser(req.user.id);

    // Validate the params
    if (
      !(
        boardId &&
        sourceIndex != undefined &&
        destinationIndex != undefined &&
        listId
      )
    )
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ errMessage: 'All parameters not provided' });

    // Validate the owner of board
    const validate = user.boards.filter((board) => board === boardId);
    if (!validate)
      return res
        .status(HttpStatus.FORBIDDEN)
        .send({ errMessage: 'You cannot edit the board that you hasnt' });

    // Call the service
    return await this.listservice
      .updateListOrder(boardId, sourceIndex, destinationIndex, listId)
      .then((result) => {
        return res.status(HttpStatus.OK).send(result);
      })
      .catch((err) => {
        throw err;
      });
  }
}
