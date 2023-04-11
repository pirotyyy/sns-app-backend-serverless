import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TweetOwnerGuard } from 'src/share/guards/tweet-owner.guard';
import { Msg } from 'src/share/interfaces/msg.interface';
import { Tweet } from 'src/share/models/tweet.model';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { UpdateTweetDto } from './dto/update-tweet.dto';
import { TweetService } from './tweet.service';

@UseGuards(AuthGuard('jwt'))
@Controller('tweet')
export class TweetController {
  constructor(private readonly tweetService: TweetService) {}

  @Post()
  create(@Body() dto: CreateTweetDto, @Req() req: Request): Promise<Msg> {
    return this.tweetService.create(req.user.userId, req.user.username, dto);
  }

  @Get('list')
  getAll(): Promise<Tweet[]> {
    return this.tweetService.getAll();
  }

  @Get(':tweetId')
  get(@Param('tweetId') tweetId: string): Promise<Tweet> {
    return this.tweetService.getByTweetId(tweetId);
  }

  @Get()
  getByUserId(@Query('userId') userId: string): Promise<Tweet[]> {
    return this.tweetService.getByUserId(userId);
  }

  @Put(':tweetId')
  @UseGuards(TweetOwnerGuard)
  update(
    @Param('tweetId') tweetId: string,
    @Body() dto: UpdateTweetDto,
  ): Promise<Msg> {
    return this.tweetService.update(tweetId, dto);
  }

  @Delete(':tweetId')
  @UseGuards(TweetOwnerGuard)
  delete(@Param('tweetId') tweetId: string): Promise<Msg> {
    return this.tweetService.delete(tweetId);
  }
}
