import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserAccessGuard } from 'src/share/guards/user-access.guard';
import { Msg } from 'src/share/interfaces/msg.interface';
import { User } from 'src/share/models/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() dto: CreateUserDto): Promise<Msg> {
    return this.userService.create(dto);
  }

  @Get('list')
  @UseGuards(AuthGuard('jwt'))
  getAll(): Promise<Omit<User, 'hashedPassword'>[]> {
    return this.userService.getAll();
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getLoginUser(@Req() req: Request): Promise<Omit<User, 'hashedPassword'>> {
    return this.userService.getById(req.user.userId);
  }

  @Get(':userId/detail')
  @UseGuards(AuthGuard('jwt'))
  get(@Param('userId') userId: string): Promise<Omit<User, 'hashedPassword'>> {
    return this.userService.getById(userId);
  }

  @Put(':userId')
  @UseGuards(AuthGuard('jwt'), UserAccessGuard)
  update(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<Msg> {
    return this.userService.update(userId, dto);
  }

  @Delete(':userId')
  @UseGuards(AuthGuard('jwt'), UserAccessGuard)
  delete(@Param('userId') userId: string): Promise<Msg> {
    return this.userService.delete(userId);
  }
}
