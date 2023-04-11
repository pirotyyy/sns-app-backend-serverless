import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TweetController } from './tweet.controller';
import { TweetService } from './tweet.service';

@Module({
  controllers: [TweetController],
  providers: [TweetService],
})
export class TweetModule {}
