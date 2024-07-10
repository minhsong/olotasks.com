import {
  Controller,
  Post,
  Put,
  Get,
  Param,
  Body,
  Request,
  Res,
} from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums/http-status.enum';
import { Response } from 'express';
import { CreateBoardDto } from 'src/app/models/dto/board/board.create';
import { UpdateBoardDto } from 'src/app/models/dto/board/board.update';
import { BoardService } from '../services/board.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserTokenPayload } from '../models/dto/user/user.tokenPayload';
import { UserService } from '../services/user.service';

@Controller('board')
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly userService: UserService,
  ) {}

  @Post(':boardId/add-member')
  @Roles([])
  async addMember(
    @Param('boardId') boardId: string,
    @Res() res: Response,
    @Request() req: any,
  ) {
    const loggedInUser = await this.userService.getUser(req.user.id);

    // Validate whether params.id is in the user's boards or not
    const validate = loggedInUser.boards.filter(
      (board) => board.toString() === boardId,
    );
    if (!validate)
      return res.status(HttpStatus.BAD_REQUEST).send({
        errMessage:
          'You can not add member to this board, you are not a member or owner!',
      });
    const { members } = req.body;
    // Call the service
    return await this.boardService
      .addMember(boardId, members, loggedInUser)
      .then((result) => {
        return res.status(HttpStatus.OK).send(result);
      })
      .catch((err) => {
        return res.status(HttpStatus.BAD_REQUEST).send(err);
      });
  }

  @Put(':boardId/update-background')
  @Roles([])
  async updateBackground(
    @Param('boardId') boardId: string,
    @Res() res: Response,
    @Request() req: any,
  ) {
    const loggedInUser = await this.userService.getUser(req.user.id);
    // Validate whether params.id is in the user's boards or not
    const validate = loggedInUser.boards.filter(
      (board) => board.toString() === boardId,
    );
    if (!validate)
      return res.status(400).send({
        errMessage:
          'You can not change background of this board, you are not a member or owner!',
      });
    const { background, isImage } = req.body;
    // Call the service
    await this.boardService
      .updateBackground(boardId, background, isImage, loggedInUser)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        return res.status(HttpStatus.BAD_REQUEST).send(err);
      });
  }

  @Put(':boardId/update-board-description')
  @Roles([])
  async updateBoardDescription(
    @Param('boardId') boardId: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @Res() res: Response,
    @Request() req: any,
  ) {
    const loggedInUser = await this.userService.getUser(req.user.id);
    // Validate whether params.id is in the user's boards or not
    const validate = loggedInUser.boards.filter(
      (board) => board.toString() === boardId,
    );
    if (!validate)
      return res.status(400).send({
        errMessage:
          'You can not change description of this board, you are not a member or owner!',
      });
    const { description } = updateBoardDto;
    // Call the service
    await this.boardService
      .updateBoardDescription(boardId, description, loggedInUser)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        return res.status(HttpStatus.BAD_REQUEST).send(err);
      });
  }

  @Put(':boardId/update-board-title')
  @Roles([])
  async updateBoardTitle(
    @Param('boardId') boardId: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @Res() res: Response,
    @Request() req: any,
  ) {
    const loggedInUser = await this.userService.getUser(req.user.id);
    // Validate whether params.id is in the user's boards or not
    const validate = loggedInUser.boards.filter(
      (board) => board.toString() === boardId,
    );
    if (!validate)
      return res.status(400).send({
        errMessage:
          'You can not change title of this board, you are not a member or owner!',
      });
    const { title } = updateBoardDto;
    // Call the service
    await this.boardService
      .updateBoardTitle(boardId, title, loggedInUser)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        return res.status(HttpStatus.BAD_REQUEST).send(err);
      });
  }

  @Post('create')
  @Roles([])
  async create(
    @Body() createBoardDto: CreateBoardDto,
    @Res() res: Response,
    @Request() req: any,
  ) {
    const { title, backgroundImageLink } = createBoardDto;
    const user = req.user as UserTokenPayload;
    if (!(title && backgroundImageLink)) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ errMessage: 'Title and/or image cannot be null' });
    }
    return await this.boardService
      .create(createBoardDto, user)
      .then((result) => {
        result.__v = undefined;
        return res.status(HttpStatus.CREATED).send(result);
      });
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.boardService.getById(id);
  }

  @Get(':id/activity')
  getActivityById(@Param('id') id: string) {
    return this.boardService.getActivityById(id);
  }

  @Get('/')
  @Roles([])
  async getAll(@Request() req) {
    const userId = req.user.id;
    return await this.boardService.getAll(userId);
  }
}
