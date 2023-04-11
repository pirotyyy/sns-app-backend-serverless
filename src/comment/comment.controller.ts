import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Request } from 'express';
import { Comment } from 'src/share/models/comment.model';
import { UpdateCommentDto } from './dto/update-comment.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Body() dto: CreateCommentDto, @Req() req: Request) {
    return this.commentService.create(req.user.userId, req.user.username, dto);
  }

  @Get(':tweetId')
  getByTweetId(@Param('tweetId') tweetId: string): Promise<Comment[]> {
    return this.commentService.getByTweetId(tweetId);
  }

  @Put(':commentId')
  update(@Param('commentId') commentId: string, @Body() dto: UpdateCommentDto) {
    return this.commentService.update(commentId, dto);
  }

  @Delete(':commentId')
  delete(@Param('commentId') commentId: string) {
    return this.commentService.delete(commentId);
  }
}
