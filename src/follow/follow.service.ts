import {
  ConditionalCheckFailedException,
  DeleteItemCommand,
  DeleteItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
  TransactionCanceledException,
  TransactWriteItemsCommand,
  TransactWriteItemsCommandInput,
} from '@aws-sdk/client-dynamodb';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ddbClient } from 'src/share/libs/ddbClient';
import {
  FollowerFormatter,
  FollowFomatter,
} from './formatters/follow.fomatter';
import { Msg } from 'src/share/interfaces/msg.interface';

@Injectable()
export class FollowService {
  private readonly tableName = process.env.TABLE_NAME;

  async follow(userId: string, followeeId: string): Promise<Msg> {
    const params: PutItemCommandInput = {
      TableName: this.tableName,
      Item: {
        PK: { S: `FOLLOW#@${userId}` },
        SK: { S: `FOLLOWEE#@${followeeId}` },
      },
      ConditionExpression:
        'attribute_not_exists(PK) and attribute_not_exists(SK)',
    };

    try {
      await ddbClient.send(new PutItemCommand(params));

      return {
        message: 'follow successfully',
      };
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new BadRequestException('You already follow this user');
      }
      throw new InternalServerErrorException('Failed to follow');
    }
  }

  async unFollow(userId: string, followeeId: string): Promise<Msg> {
    const params: DeleteItemCommandInput = {
      TableName: this.tableName,
      Key: {
        PK: { S: `FOLLOW#@${userId}` },
        SK: { S: `FOLLOWEE#@${followeeId}` },
      },
      ConditionExpression: 'attribute_exists(PK) and attribute_exists(SK)',
    };

    try {
      await ddbClient.send(new DeleteItemCommand(params));

      return {
        message: 'follow successfully',
      };
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new BadRequestException('You not follow this user');
      }
      throw new InternalServerErrorException('Failed to follow');
    }
  }

  async getFollow(userId: string): Promise<string[]> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: '#PK = :pk and begins_with(#SK, :sk)',
      ExpressionAttributeNames: {
        '#PK': 'PK',
        '#SK': 'SK',
      },
      ExpressionAttributeValues: {
        ':pk': { S: `FOLLOW#@${userId}` },
        ':sk': { S: 'FOLLOWEE#@' },
      },
    };

    try {
      const result = await ddbClient.send(new QueryCommand(params));

      const Follows = result.Items.map((item) => {
        return FollowFomatter(item);
      });

      return Follows;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get follow');
    }
  }

  async getFollower(userId: string): Promise<string[]> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: 'SK-PK-index',
      KeyConditionExpression: 'begins_with(#PK, :pk) and #SK = :sk',
      ExpressionAttributeNames: {
        '#PK': 'PK',
        '#SK': 'SK',
      },
      ExpressionAttributeValues: {
        ':pk': { S: 'FOLLOW#@' },
        ':sk': { S: `FOLLOWEE#@${userId}` },
      },
    };

    try {
      const result = await ddbClient.send(new QueryCommand(params));

      const Followers = result.Items.map((item) => {
        return FollowerFormatter(item);
      });
      return Followers;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get follow');
    }
  }
}
