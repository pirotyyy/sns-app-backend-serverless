import {
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { FollowService } from './follow.service';

@Controller()
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Put('follow/:followeeId')
  @UseGuards(AuthGuard('jwt'))
  follow(@Param('followeeId') followeeId: string, @Req() req: Request) {
    return this.followService.follow(req.user.userId, followeeId);
  }

  @Delete('unfollow/:followeeId')
  @UseGuards(AuthGuard('jwt'))
  unFollow(@Param('followeeId') followeeId: string, @Req() req: Request) {
    return this.followService.unFollow(req.user.userId, followeeId);
  }

  @Get('follow/:userId')
  @UseGuards(AuthGuard('jwt'))
  getFollow(@Param('userId') userId: string) {
    return this.followService.getFollow(userId);
  }

  @Get('follower/:userId')
  @UseGuards(AuthGuard('jwt'))
  getFollower(@Param('userId') userId: string) {
    return this.followService.getFollower(userId);
  }
}
