import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { UserService } from '../services/user.service';
import { hashPassword, jwtSign } from 'src/utils/jwthelper';
import { Roles } from 'src/decorators/roles.decorator';
import { Response } from 'express';
import { userPrivate, userpublic } from 'src/utils/helperMethods';
import { UserRegisterDto } from '../models/dto/user/user.register';
import { LoginDto } from '../models/dto/user/user.login';
import { GetUserWithEmailDto } from '../models/dto/user/user.getByEmail';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  @Post('register')
  async register(
    @Body() body: UserRegisterDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const { name, surname, email, password } = body;

    const result = await this.userService
      .register({
        name,
        surname,
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
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });

    if (!result)
      return res
        .status(400)
        .send({ errMessage: 'Your email/password is wrong!' });

    return res.status(200).send({
      message: 'User login successful!',
      user: {
        ...userPrivate(result),
        token: await jwtSign({ id: result._id, email: result.email }),
      },
    });
  }

  @Get('get-user')
  @Roles([])
  async getUser(@Req() req: any): Promise<any> {
    const user = req.user;

    if (user) {
      return { ...user, password: undefined, __v: undefined };
    } else {
      throw new Error('User not found!');
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
}
