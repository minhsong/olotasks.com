import {
  Controller,
  Post,
  Put,
  Get,
  Param,
  Body,
  Request,
  Res,
  Delete,
} from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums/http-status.enum';
import e, { Response } from 'express';
import { CreateBoardDto } from 'src/app/models/dto/board/board.create';
import { UpdateBoardDto } from 'src/app/models/dto/board/board.update';
import { BoardService } from '../services/board.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserTokenPayload } from '../models/dto/user/user.tokenPayload';
import { UserService } from '../services/user.service';
import { User } from '../models/schemas/user.shema';
import { jwtSign } from 'src/utils/jwthelper';
import { EmailService } from '../services/email.service';

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

  @Post(':boardId/add-member-by-emails')
  @Roles([])
  async addMemberByEmail(
    @Param('boardId') boardId: string,
    @Res() res: Response,
    @Request() req: any,
  ) {
    const loggedInUser = req.user as User;
    const board = await this.boardService.getBoardByShortId(
      boardId,
      loggedInUser._id,
    );
    if (!board) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ errMessage: 'Board not found' });
    }

    const loggedBoardMember = board.members.find(
      (member) => member.user.toString() === loggedInUser._id.toString(),
    );

    if (['owner', 'admin'].includes(loggedBoardMember.role)) {
      const { emails } = req.body;
      const users = await this.userService.getUsersByEmails(emails);
      const registedEmails = users.map((s) => s.email);
      const unregistedEmails = emails.filter(
        (email) => !registedEmails.includes(email),
      );
      await this.boardService.addMember(boardId, users, loggedInUser);
      // send invite email to unregisted emails
      users.forEach((user) => {
        if (user.status === 'inviting') {
          const token = jwtSign(
            { email: user.email, id: user._id },
            {},
            '360d',
          );
          this.mailService.sendEmail(
            user.email,
            '[Olotasks]Invite to join board',
            `You have been invited to join a board ${board.title}`,
            `<p>You have been invited to join a Olotasks board <a target="_blank" href="${process.env.CLIENT_URL}/b/${board.shortId}-${board.title}">${board.title}</a> by ${loggedInUser.name}.</p>
             <p>Please click the link to join <a target="_blank" href="${process.env.CLIENT_URL}/invited?email=${user.email}&token=${token}">Join</a></p>
             <p>Or copy and paste the link below to your browser</p>
             <p>${process.env.CLIENT_URL}/invited?email=${user.email}&token=${token}</p>`,
          );
        } else {
          this.mailService.sendEmail(
            user.email,
            '[Olotasks]Invite to join board',
            `You have been invited to join a board ${board.title}`,
            `You have been invited to join a Olotasks board ${board.title} by ${loggedInUser.name}. Please click the link to join <br/>
           ${process.env.CLIENT_URL}/b/${board.shortId}-${board.title}`,
          );
        }
      });

      this.userService.updateCacheUser(
        users
          .filter((s) => s.status != 'inviting')
          .map((s) => s._id.toString()),
      );

      // create invite account for unregisted emails
      await Promise.all(
        unregistedEmails.map(async (email) => {
          return await this.userService
            .createUserWithEmail(email)
            .then(async (newUser) => {
              // sent email to new user
              const token = await jwtSign(
                { email: newUser.email, id: newUser._id },
                {},
                '360d',
              );
              this.mailService.sendEmail(
                newUser.email,
                '[Olotasks] Invite to join board',
                `You have been invited to join a board ${board.title}`,
                `<p>You have been invited to join a Olotasks board <a target="_blank" href="${process.env.CLIENT_URL}/b/${board.shortId}-${board.title}">${board.title}</a> by ${loggedInUser.name}.</p>
                 <p>Please click the link to join <a target="_blank" href="${process.env.CLIENT_URL}/invited?email=${newUser.email}&token=${token}">Join</a></p>
                 <p>Or copy and paste the link below to your browser</p>
                 <p>${process.env.CLIENT_URL}/invited?email=${newUser.email}&token=${token}</p>`,
              );
              return newUser;
            })
            .catch((err) => {
              return null;
            });
        }),
      ).then((newUsers) => {
        return this.boardService.addMember(
          boardId,
          newUsers,
          loggedInUser,
          true,
        );
      });

      return res.status(HttpStatus.OK).send(board.members);
    } else {
      return res.status(HttpStatus.BAD_REQUEST).send({
        errMessage: 'You are not allowed to add member to this board',
      });
    }
  }

  @Post(':boardId/member/resend-invite')
  @Roles([])
  async resentInvite(
    @Param('boardId') boardId: string,
    @Res() res: Response,
    @Request() req: any,
  ) {
    const loggedInUser = req.user as User;
    const board = await this.boardService.getBoardByShortId(
      boardId,
      loggedInUser._id,
    );
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
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ errMessage: 'User not found' });
      }

      const token = await jwtSign(
        { email: user.email, id: user._id },
        {},
        '360d',
      );
      // send invite email to unregisted emails
      this.mailService.sendEmail(
        user.email,
        '[Olotasks] Invite to join board',
        `You have been invited to join a board ${board.title}`,
        `<p>You have been invited to join a Olotasks board <a target="_blank" href="${process.env.CLIENT_URL}/b/${board.shortId}-${board.title}">${board.title}</a> by ${loggedInUser.name}.</p>
         <p>Please click the link to join <a target="_blank" href="${process.env.CLIENT_URL}/invited?email=${user.email}&token=${token}">Join</a></p>
         <p>Or copy and paste the link below to your browser</p>
         <p>${process.env.CLIENT_URL}/invited?email=${user.email}&token=${token}</p>`,
      );
    }
    return res.status(HttpStatus.OK).send({ message: 'Invite resent' });
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
  @Roles([])
  getById(@Param('id') id: string, @Request() req) {
    const user = req.user as User;
    return this.boardService.getBoardByShortId(id, user._id);
  }

  @Get(':id/activity')
  @Roles([])
  getActivityById(@Param('id') id: string) {
    return this.boardService.getActivityById(id);
  }

  @Get('/')
  @Roles([])
  async getAll(@Request() req) {
    const user = req.user;
    return await this.boardService.getAll(user);
  }

  @Delete(':id/member/leave')
  @Roles([])
  async leaveBoard(@Param('id') id: string, @Request() req) {
    const user = req.user as User;
    return await this.boardService.leaveBoard(id, user).then((result) => {
      this.userService.updateCacheUser([user._id.toString()]);
      return result;
    });
  }

  @Delete(':id/member/:memberId')
  @Roles([])
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ) {
    const user = req.user as User;
    return await this.boardService
      .removeMember(id, memberId, user)
      .then((result) => {
        this.userService.updateCacheUser([memberId]);
        return result;
      });
  }

  @Put(':id/member/change-role')
  @Roles([])
  async changeRole(
    @Param('id') id: string,
    @Body() body: { memberId: string; role: string },
    @Request() req,
  ) {
    const user = req.user as User;
    return await this.boardService.changeRole(
      id,
      body.memberId,
      body.role,
      user,
    );
  }
}
