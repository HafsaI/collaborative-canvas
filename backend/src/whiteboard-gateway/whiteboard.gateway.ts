import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ElementsService } from '../elements/elements.service';
import { RoomsService } from '../rooms/rooms.service';
import {
  ElementEndPayload,
  ElementStartPayload,
  ElementUpdatePayload,
  JoinRoomPayload,
  RoomActionPayload,
  RoomUser,
} from './whiteboard.events';

interface SocketData {
  roomId?: string;
  user?: { userId: string; name: string; color: string };
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN ?? '*',
  },
})
export class WhiteboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(WhiteboardGateway.name);

  /** roomId -> socketId -> user */
  private readonly roomUsers = new Map<string, Map<string, RoomUser>>();

  constructor(
    private readonly roomsService: RoomsService,
    private readonly elementsService: ElementsService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.debug(`client connected ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const data = client.data as SocketData;
    if (data?.roomId) {
      this.removeUserFromRoom(data.roomId, client.id);
      this.server.to(data.roomId).emit('room:users', this.listUsers(data.roomId));
    }
  }

  @SubscribeMessage('room:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    const roomExists = await this.roomsService.exists(payload.roomId);
    if (!roomExists) {
      client.emit('error:message', `Room ${payload.roomId} does not exist`);
      return;
    }

    client.join(payload.roomId);
    client.data = { roomId: payload.roomId, user: payload.user } satisfies SocketData;

    this.addUserToRoom(payload.roomId, client.id, payload.user);

    const elements = await this.elementsService.listByRoom(payload.roomId);
    client.emit('room:init', { elements, users: this.listUsers(payload.roomId) });

    this.server.to(payload.roomId).emit('room:users', this.listUsers(payload.roomId));
  }

  @SubscribeMessage('room:leave')
  handleLeave(@ConnectedSocket() client: Socket, @MessageBody() payload: RoomActionPayload) {
    client.leave(payload.roomId);
    this.removeUserFromRoom(payload.roomId, client.id);
    this.server.to(payload.roomId).emit('room:users', this.listUsers(payload.roomId));
  }

  @SubscribeMessage('element:start')
  handleElementStart(@ConnectedSocket() client: Socket, @MessageBody() payload: ElementStartPayload) {
    client.to(payload.roomId).emit('element:start', { ...payload, socketId: client.id });
  }

  @SubscribeMessage('element:update')
  handleElementUpdate(@ConnectedSocket() client: Socket, @MessageBody() payload: ElementUpdatePayload) {
    client.to(payload.roomId).emit('element:update', payload);
  }

  @SubscribeMessage('element:end')
  async handleElementEnd(@ConnectedSocket() client: Socket, @MessageBody() payload: ElementEndPayload) {
    const data = client.data as SocketData;
    const createdBy = data?.user?.userId ?? 'unknown';

    const saved = await this.elementsService.create({
      id: payload.id,
      roomId: payload.roomId,
      type: payload.type,
      color: payload.color,
      strokeWidth: payload.strokeWidth,
      data: payload.data,
      createdBy,
    });

    this.server.to(payload.roomId).emit('element:end', saved);
  }

  @SubscribeMessage('board:undo')
  async handleUndo(@ConnectedSocket() client: Socket, @MessageBody() payload: RoomActionPayload) {
    const removed = await this.elementsService.deleteLastInRoom(payload.roomId);
    if (removed) {
      this.server.to(payload.roomId).emit('board:undo', { id: removed.id });
    }
  }

  @SubscribeMessage('board:clear')
  async handleClear(@ConnectedSocket() client: Socket, @MessageBody() payload: RoomActionPayload) {
    await this.elementsService.clearRoom(payload.roomId);
    this.server.to(payload.roomId).emit('board:clear');
  }

  private addUserToRoom(roomId: string, socketId: string, user: JoinRoomPayload['user']) {
    if (!this.roomUsers.has(roomId)) this.roomUsers.set(roomId, new Map());
    this.roomUsers.get(roomId)!.set(socketId, { socketId, ...user });
  }

  private removeUserFromRoom(roomId: string, socketId: string) {
    this.roomUsers.get(roomId)?.delete(socketId);
    if (this.roomUsers.get(roomId)?.size === 0) this.roomUsers.delete(roomId);
  }

  private listUsers(roomId: string): RoomUser[] {
    return Array.from(this.roomUsers.get(roomId)?.values() ?? []);
  }
}
