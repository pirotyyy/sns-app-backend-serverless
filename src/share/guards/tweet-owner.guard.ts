import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { TweetService } from 'src/tweet/tweet.service';

@Injectable()
export class TweetOwnerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tweetService: TweetService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tweetId = request.params.tweetId;
    const tweet = await this.tweetService.getByTweetId(tweetId);
    const user = request.user;

    return tweet.userId === user.userId;
  }
}
