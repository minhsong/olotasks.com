import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Res,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { hashPassword, jwtDecode, jwtSign } from 'src/utils/jwthelper';
import { Roles } from 'src/decorators/roles.decorator';
import { Response } from 'express';
import { userPrivate, userpublic } from 'src/utils/helperMethods';
import { UserRegisterDto } from '../models/dto/user/user.register';
import { LoginDto } from '../models/dto/user/user.login';
import { GetUserWithEmailDto } from '../models/dto/user/user.getByEmail';
import { RedisService } from '../redis/redis.service';
import { User } from '../models/schemas/user.shema';
import { EmailService } from '../services/email.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  @Post('register')
  async register(
    @Body() body: UserRegisterDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const { name, surename, email, password } = body;

    const result = await this.userService
      .register({
        name,
        surename,
        email,
        password: await hashPassword(password),
      })
      .then((result) => {
        return {
          message: 'User created successfully!',
          user: userPrivate(result),
        };
      })
      .catch((err) => {
        return { errMessage: 'Email already in use!', details: err };
      });

    return res.status(HttpStatus.CREATED).send(result);
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Req() req: any, @Res() res: any) {
    const { email, password } = body;
    const result = await this.userService
      .login(email, password)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return null;
      });

    if (!result)
      return res
        .status(400)
        .send({ errMessage: 'Your email/password is wrong!' });
    this.redisService.SetUserData(userpublic(res)).catch((err) => {});
    return res.status(200).send({
      message: 'User login successful!',
      user: {
        ...userPrivate(result),
        token: await jwtSign({ id: result._id, email: result.email }),
      },
    });
  }

  @Delete('logout')
  @Roles([])
  async logout(@Req() req: any, @Res() res: any) {
    const user = req.user as User;
    this.redisService.removeUserCache(user._id.toString());
    return { success: true };
  }

  @Get('get-user')
  @Roles([])
  async getUser(@Req() req: any): Promise<any> {
    const user = req.user;

    if (user) {
      return { ...user, password: undefined, __v: undefined };
    } else {
      return null;
    }
  }

  @Post('get-user-with-email')
  @Roles([])
  async getUserWithEmail(@Body() body: GetUserWithEmailDto) {
    const { email } = body;
    return await this.userService
      .getUserWithMail(email)
      .then((result) => {
        return userpublic(result);
      })
      .catch((err) => {
        throw err;
      });
  }

  @Post('request-reset-password')
  async RequestResetPassword(@Body() body: GetUserWithEmailDto) {
    const { email } = body;
    const user = await this.userService.getUserWithMail(email);
    if (!user) {
      throw Error('User not found!');
    }

    const token = await jwtSign({ email: user.email, id: user._id }, {}, '1h');
    const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM_ADDRESS,
      to: user.email,
      subject: '[OloTasks.com] Password reset request',
      text: `Please click the link to reset your password: ${link}\nLink expires in 1 hour`,
      html: `<p>Please click the link to reset your password: <a href="${link}">${link}</a></p><p>Link expires in 1 hour</p>`,
    };
    try {
      await this.emailService.sendEmail(
        email,
        mailOptions.subject,
        mailOptions.text,
        mailOptions.html,
      );

      return { message: 'Email sent!' };
    } catch (err) {
      throw Error('Error sending email!');
    }
  }

  @Post('reset-password')
  async ResetPassword(
    @Body() body: { email: string; token: string; password: string },
  ) {
    const { email, token, password } = body;
    if (!email || !token || !password) {
      throw Error('Invalid request!');
    }
    const user = await jwtDecode(token);
    if (!user) {
      throw Error('Invalid token!');
    }

    await this.userService.updatePassword(
      user.email,
      await hashPassword(password),
    );
    return { message: 'Password updated!' };
  }
  @Post('complete-invite')
  async loadInvitingUser(
    @Body() body: UserRegisterDto & { token: string },
    @Res() res: any,
  ) {
    const { token, email, name, password, surename } = body;
    const user = await jwtDecode(token);
    if (!user) {
      throw Error('Invalid token!');
    }
    if (user.email !== email) {
      throw Error('Invalid email!');
    }

    const invitedUser = await this.userService.getUserWithMail(user.email);
    if (!invitedUser) {
      throw Error('User not found!');
    }

    if (invitedUser.status !== 'inviting') {
      return res.status(200).send({
        message: 'User login successful!',
        user: {
          ...userPrivate(invitedUser),
          token: await jwtSign({
            id: invitedUser._id,
            email: invitedUser.email,
          }),
        },
      });
    } else {
      const result = await this.userService.updateUser(invitedUser._id, {
        name,
        surename,
        password: await hashPassword(password),
        status: 'invited',
      });
      return res.status(200).send({
        message: 'User login successful!',
        token: await jwtSign({
          id: result._id,
          email: result.email,
        }),
      });
    }
  }
}
