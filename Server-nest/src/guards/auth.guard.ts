import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from 'src/decorators/roles.decorator';
import { extractTokenFromHeader, jwtDecode } from 'src/utils/jwthelper';
import { isEmpty } from 'lodash';
import { RedisService } from 'src/app/redis/redis.service';
import { UserService } from 'src/app/services/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly redisService: RedisService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const roles = this.reflector.get(Roles, context.getHandler());
    let user = null;
    const token = extractTokenFromHeader(request);
    if (!isEmpty(token)) {
      try {
        const payload = await jwtDecode(token);
        // 💡 We're assigning the payload to the request object here
        // so that we can access it in our route handlers
        if (!payload) throw new UnauthorizedException();

        user = await this.redisService.GetUserData(payload.id).catch(() => {
          return null;
        });
        if (user) {
          request['user'] = user;
        } else {
          user = await this.userService.getUser(payload.id);

          if (!user) throw new UnauthorizedException();

          this.redisService.SetUserData(user);
          request['user'] = user;
        }
      } catch {}
    }

    // 💡 If the route is not decorated with the @Roles decorator
    if (roles == undefined) {
      return true;
    } else {
      // 💡 If the route is decorated with the @Roles decorator
      // emtpy array means that the route is public
      if (!isEmpty(user)) {
        if (roles && (roles.length == 0 || roles.includes(user.role))) {
          return true;
        }
      }
    }
    throw new UnauthorizedException();
  }
}
