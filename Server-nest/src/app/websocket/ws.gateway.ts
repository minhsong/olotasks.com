// ws.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { extractTokenFromWS, jwtDecode } from 'src/utils/jwthelper';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
})
export class WsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor() {}

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      const token = extractTokenFromWS(client);

      const payload = await jwtDecode(token);
      client.data.user = payload;
    } catch (error) {
      throw new Error('Unauthorized');
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected');
  }

  // Example of sending a message to all clients
  sendMessage(message: string) {
    this.server.emit('message', message);
  }
}
