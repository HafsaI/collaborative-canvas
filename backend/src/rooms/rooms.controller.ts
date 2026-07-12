import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { isUuid } from '../common/utils';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto.name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (!isUuid(id)) throw new NotFoundException(`Room ${id} not found`);
    return this.roomsService.findById(id);
  }
}
