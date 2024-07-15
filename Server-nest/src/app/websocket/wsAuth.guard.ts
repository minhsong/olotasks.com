import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { jwtDecode } from 'src/utils/jwthelper';
import { Socket } from 'socket.io';

// jwt-auth.guard.ts

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const [type, token] = client.handshake.auth.token.split(' '); // Retrieve Bearer token from handshake.auth.token
    if (!token) {
      return false;
    }
    try {
      const payload = await jwtDecode(token);
      client.data.user = payload;
      return true;
    } catch (error) {
      return false;
    }
  }
}
