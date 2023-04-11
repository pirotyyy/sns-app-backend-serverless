import {
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller()
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Put('like/:tweetId')
  @UseGuards(AuthGuard('jwt'))
  like(@Param('tweetId') tweetId: string, @Req() req: Request) {
    return this.likeService.like(req.user.userId, tweetId);
  }

  @Delete('unlike/:tweetId')
  @UseGuards(AuthGuard('jwt'))
  unFollow(@Param('tweetId') tweetId: string, @Req() req: Request) {
    return this.likeService.unLike(req.user.userId, tweetId);
  }

  @Get('like/:tweetId')
  @UseGuards(AuthGuard('jwt'))
  getFollow(@Param('tweetId') tweetId: string) {
    return this.likeService.getLike(tweetId);
  }
}
