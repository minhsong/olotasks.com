import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { jwtDecode } from 'src/utils/jwthelper';
import { Socket } from 'socket.io';
import { Reflector } from '@nestjs/core';
import { Roles } from 'src/decorators/roles.decorator';
import { isEmpty } from 'lodash';
// jwt-auth.guard.ts

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const roles = this.reflector.get(Roles, context.getHandler());
    const [type, token] = client.handshake.auth.token.split(' '); // Retrieve Bearer token from handshake.auth.token
    if (!token) {
      return false;
    }
    try {
      const payload = await jwtDecode(token);
      client.data.user = payload;
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
      return false;
    } catch (error) {
      return false;
    }
  }
}
