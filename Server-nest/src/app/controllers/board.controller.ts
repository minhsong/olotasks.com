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
import { EmailService } from '../services/email.service';
import { User } from '../models/schemas/user.shema';

@Controller('board')
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly userService: UserService,
    private readonly mailService: EmailService,
  ) {}

  @Get('/fixed-boards')
  @Roles([])
  async getFixedBoards(@Request() req) {
    return await this.boardService.getFixedBoards();
  }

  @Post(':boardId/add-member')
  @Roles([])
  async addMember(
    @Param('boardId') boardId: string,
    @Res() res: Response,
    @Request() req: any,
  ) {
    const user = req.user as User;

    const { members } = req.body;
    // Call the service
    return await this.boardService
      .addMember(boardId, members, user)
      .then((result) => {
        return res.status(HttpStatus.OK).send(result);
      })
      .catch((err) => {
        return res.status(HttpStatus.BAD_REQUEST).send(err);
      });
  }

  @Post(':boardId/add-member-by-email')
  @Roles([])
  async addMemberByEmail(
    @Param('boardId') boardId: string,
    @Res() res: Response,
    @Request() req: any,
  ) {
    const loggedInUser = req.user as User;
    const board = await this.boardService.getBoardByShortId(boardId);
    if (!board) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ errMessage: 'Board not found' });
    }

    const loggedBoardMember = board.members.find(
      (member) => member.user.toString() === loggedInUser._id.toString(),
    );
    if (['owner', 'admin'].includes(loggedBoardMember.role)) {
      const { email } = req.body;
      const user = await this.userService.getUserWithMail(email);
      if (!user) {
        // create user with email
        const newUser = await this.userService
          .createUserWithEmail({
            email: email,
          })
          .catch((err) => {
            return null;
          });

        // send email to new user

        if (newUser) {
          return await this.boardService
            .addMember(boardId, newUser, loggedInUser, true)
            .then((result) => {
              return res.status(HttpStatus.OK).send(result);
            })
            .catch((err) => {
              return res.status(HttpStatus.BAD_REQUEST).send(err);
            });
        } else {
          return res
            .status(HttpStatus.BAD_REQUEST)
            .send({ errMessage: 'User not found' });
        }
      } else {
        return await this.boardService
          .addMember(boardId, user, loggedInUser)
          .then((result) => {
            return res.status(HttpStatus.OK).send(result);
          })
          .catch((err) => {
            return res.status(HttpStatus.BAD_REQUEST).send(err);
          });
      }
    } else {
      return res.status(HttpStatus.BAD_REQUEST).send({
        errMessage: 'You are not allowed to add member to this board',
      });
    }
  }

  @Put(':boardId/update-background')
  @Roles([])
  async updateBackground(
    @Param('boardId') boardId: string,
    @Res() res: Response,
    @Request() req: any,
  ) {
    const loggedInUser = req.user as User;
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
    const loggedInUser = req.user as User;
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
    const loggedInUser = req.user as User;
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
    const user = req.user as User;
    if (!(title && backgroundImageLink)) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ errMessage: 'Title and/or image cannot be null' });
    }
    return await this.boardService
      .create(createBoardDto, user)
      .then((result) => {
        this.userService.updateCacheUser(result.members.map((s) => s.user));
        result.__v = undefined;
        return res.status(HttpStatus.CREATED).send(result);
      });
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.boardService.getBoardByShortId(id);
  }

  @Get(':id/activity')
  getActivityById(@Param('id') id: string) {
    return this.boardService.getActivityById(id);
  }

  @Get('/')
  @Roles([])
  async getAll(@Request() req) {
    const user = req.user;
    return await this.boardService.getAll(user);
  }
}
