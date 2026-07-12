import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ElementsModule } from './elements/elements.module';
import { RoomsModule } from './rooms/rooms.module';
import { WhiteboardGatewayModule } from './whiteboard-gateway/whiteboard-gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    RoomsModule,
    ElementsModule,
    WhiteboardGatewayModule,
  ],
})
export class AppModule {}
