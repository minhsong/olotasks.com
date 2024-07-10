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
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const roles = this.reflector.get(Roles, context.getHandler());
    let payload = null;
    const token = extractTokenFromHeader(request);
    if (!isEmpty(token)) {
      try {
        payload = await jwtDecode(token);
        // 💡 We're assigning the payload to the request object here
        // so that we can access it in our route handlers
        request['user'] = payload;
      } catch {}
    }

    // 💡 If the route is not decorated with the @Roles decorator
    if (roles == undefined) {
      return true;
    } else {
      // 💡 If the route is decorated with the @Roles decorator
      // emtpy array means that the route is public
      if (!isEmpty(payload)) {
        if (roles && (roles.length == 0 || roles.includes(payload.role))) {
          return true;
        }
      }
    }
    throw new UnauthorizedException();
  }
}
