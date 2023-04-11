import {
  ConditionalCheckFailedException,
  DeleteItemCommand,
  DeleteItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ddbClient } from 'src/share/libs/ddbClient';
import { LikeFomatter } from './formatters/like.fomatter';
import { Msg } from 'src/share/interfaces/msg.interface';

@Injectable()
export class LikeService {
  private readonly tableName = process.env.TABLE_NAME;

  async like(userId: string, tweetId: string): Promise<Msg> {
    const params: PutItemCommandInput = {
      TableName: this.tableName,
      Item: {
        PK: { S: `TWEET#${tweetId}` },
        SK: { S: `LIKED#@${userId}` },
      },
      ConditionExpression:
        'attribute_not_exists(PK) and attribute_not_exists(SK)',
    };

    try {
      await ddbClient.send(new PutItemCommand(params));

      return {
        message: 'like succesfully',
      };
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new BadRequestException('You already liked this tweet');
      }
      throw new InternalServerErrorException('Failed to like');
    }
  }

  async unLike(userId: string, tweetId: string): Promise<Msg> {
    const params: DeleteItemCommandInput = {
      TableName: this.tableName,
      Key: {
        PK: { S: `TWEET#${tweetId}` },
        SK: { S: `LIKED#@${userId}` },
      },
      ConditionExpression: 'attribute_exists(PK) and attribute_exists(SK)',
    };

    try {
      await ddbClient.send(new DeleteItemCommand(params));

      return {
        message: 'unlike succesfully',
      };
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new BadRequestException('You not liked this tweet');
      }
      throw new InternalServerErrorException('Failed to unlike');
    }
  }

  async getLike(tweetId: string): Promise<string[]> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: '#PK = :pk and begins_with(#SK, :sk)',
      ExpressionAttributeNames: {
        '#PK': 'PK',
        '#SK': 'SK',
      },
      ExpressionAttributeValues: {
        ':pk': { S: `TWEET#${tweetId}` },
        ':sk': { S: 'LIKED#@' },
      },
    };

    try {
      const result = await ddbClient.send(new QueryCommand(params));

      const Likes = result.Items.map((item) => {
        return LikeFomatter(item);
      });

      return Likes;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get like');
    }
  }
}
