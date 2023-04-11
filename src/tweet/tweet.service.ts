import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTweetDto } from './dto/create-tweet.dto';

import { v4 as uuidv4 } from 'uuid';
import { ddbClient } from 'src/share/libs/ddbClient';
import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { UpdateTweetDto } from './dto/update-tweet.dto';
import { Msg } from 'src/share/interfaces/msg.interface';
import { TweetFormatter } from './formatters/tweet.formatter';
import { Tweet } from 'src/share/models/tweet.model';

@Injectable()
export class TweetService {
  private readonly tableName = process.env.TABLE_NAME;

  async create(
    userId: string,
    username: string,
    dto: CreateTweetDto,
  ): Promise<any> {
    const now = Date.now();
    const id = uuidv4();
    const params: PutItemCommandInput = {
      TableName: this.tableName,
      Item: {
        PK: { S: `TWEET#${id}` },
        SK: { S: 'tweet' },
        Data: { S: `@${userId}` },
        Username: { S: username },
        Text: { S: dto.text },
        CreatedAt: { N: now.toString() },
      },
    };

    try {
      await ddbClient.send(new PutItemCommand(params));
      const tweet = TweetFormatter(params.Item);

      return {
        message: 'Tweet created successfully',
        body: tweet,
      };
    } catch (error) {
      throw error;
    }
  }

  async getByTweetId(tweetId: string): Promise<Tweet> {
    const params: GetItemCommandInput = {
      TableName: this.tableName,
      Key: {
        PK: { S: `TWEET#${tweetId}` },
        SK: { S: 'tweet' },
      },
    };

    try {
      const result = await ddbClient.send(new GetItemCommand(params));

      const tweet = TweetFormatter(result.Item);
      return tweet;
    } catch (error) {
      throw error;
    }
  }

  async getByUserId(userId: string): Promise<Tweet[]> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: 'SK-Data-index',
      KeyConditionExpression: '#SK = :sk and #Data = :data',
      ExpressionAttributeNames: {
        '#SK': 'SK',
        '#Data': 'Data',
      },
      ExpressionAttributeValues: {
        ':sk': { S: 'tweet' },
        ':data': { S: `@${userId}` },
      },
    };

    try {
      const result = await ddbClient.send(new QueryCommand(params));

      const tweets = result.Items.map((tweet) => {
        return TweetFormatter(tweet);
      });
      return tweets;
    } catch (error) {
      throw error;
    }
  }

  async getAll(): Promise<Tweet[]> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: 'SK-PK-index',
      KeyConditionExpression: 'begins_with(#PK, :pk) and #SK = :sk',
      ExpressionAttributeNames: {
        '#PK': 'PK',
        '#SK': 'SK',
      },
      ExpressionAttributeValues: {
        ':pk': { S: 'TWEET#' },
        ':sk': { S: 'tweet' },
      },
    };

    try {
      const result = await ddbClient.send(new QueryCommand(params));

      const tweets = result.Items.map((tweet) => {
        return TweetFormatter(tweet);
      });

      return tweets;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get tweets');
    }
  }

  async update(id: string, dto: UpdateTweetDto): Promise<Msg> {
    const params: UpdateItemCommandInput = {
      TableName: this.tableName,
      Key: {
        PK: { S: `TWEET#${id}` },
        SK: { S: 'tweet' },
      },
      UpdateExpression: 'set #Text = :text',
      ExpressionAttributeNames: {
        '#Text': 'Text',
      },
      ExpressionAttributeValues: {
        ':text': { S: dto.text },
      },
    };

    try {
      await ddbClient.send(new UpdateItemCommand(params));

      return {
        message: 'Tweet updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update');
    }
  }

  async delete(id: string): Promise<Msg> {
    const params: DeleteItemCommandInput = {
      TableName: this.tableName,
      Key: {
        PK: { S: `TWEET#${id}` },
        SK: { S: 'tweet' },
      },
    };

    try {
      await ddbClient.send(new DeleteItemCommand(params));

      return {
        message: 'Tweet deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete');
    }
  }
}
