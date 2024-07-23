// ws.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { extractTokenFromWS, jwtDecode } from 'src/utils/jwthelper';
import { Roles } from 'src/decorators/roles.decorator';

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
  public users: { [key: string]: string } = {};
  constructor() {}

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      const token = extractTokenFromWS(client);

      const payload = await jwtDecode(token);
      client.data.user = payload;
      this.users[payload.id.toString()] = client.id;
    } catch (error) {
      throw new Error('Unauthorized');
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected');
    delete this.users[client.data.user.id];
  }

  @SubscribeMessage('joinRoom')
  @Roles([])
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.join(room);
    client.emit('message', `Joined room: ${room}`);
    console.log('Joined room: ', room);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.leave(room);
    client.emit('message', `Left room: ${room}`);
    console.log('Left room: ', room);
  }

  sendMessage(message: string) {
    this.server.emit('message', message);
  }

  sendMessageToUser(userId: string, message: any, data: any) {
    const socketId = this.users[userId];
    this.server.to(socketId).emit(message, data);
  }

  boradcastMessageToRoom(room: string, message: string, data: any) {
    this.server.to(room).emit(message, data);
  }

  joinRoom(client: Socket, room: string) {
    client.join(room);
  }

  leaveRoom(client: Socket, room: string) {
    client.leave(room);
  }
}
