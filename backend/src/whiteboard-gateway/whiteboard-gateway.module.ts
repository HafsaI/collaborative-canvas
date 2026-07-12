import { Module } from '@nestjs/common';
import { ElementsModule } from '../elements/elements.module';
import { RoomsModule } from '../rooms/rooms.module';
import { WhiteboardGateway } from './whiteboard.gateway';

@Module({
  imports: [ElementsModule, RoomsModule],
  providers: [WhiteboardGateway],
})
export class WhiteboardGatewayModule {}
