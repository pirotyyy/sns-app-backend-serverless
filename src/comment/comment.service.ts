import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ddbClient } from 'src/share/libs/ddbClient';

import { v4 as uuidv4 } from 'uuid';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentFormatter } from './formatter/comment.formatter';
import { Comment } from 'src/share/models/comment.model';
import { Msg } from 'src/share/interfaces/msg.interface';

@Injectable()
export class CommentService {
  private readonly tableName = process.env.TABLE_NAME;

  async create(
    userId: string,
    username: string,
    dto: CreateCommentDto,
  ): Promise<any> {
    const commentId = uuidv4();
    const now = Date.now();
    const params: PutItemCommandInput = {
      TableName: this.tableName,
      Item: {
        PK: { S: `COMMENT#${commentId}` },
        SK: { S: 'comment' },
        Data: { S: `TWEET#${dto.tweetId}` },
        UserId: { S: `@${userId}` },
        Username: { S: username },
        Text: { S: dto.text },
        CreatedAt: { N: now.toString() },
      },
      ConditionExpression: 'attribute_not_exists(SK)',
    };

    try {
      await ddbClient.send(new PutItemCommand(params));
      const comment = CommentFormatter(params.Item);

      return {
        message: 'Comment added succesfully',
        body: comment,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create comment');
    }
  }

  async getByTweetId(tweetId: string): Promise<Comment[]> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: 'SK-Data-index',
      KeyConditionExpression: '#SK = :sk and #Data = :data',
      ExpressionAttributeNames: {
        '#SK': 'SK',
        '#Data': 'Data',
      },
      ExpressionAttributeValues: {
        ':sk': { S: 'comment' },
        ':data': { S: `TWEET#${tweetId}` },
      },
    };

    try {
      const result = await ddbClient.send(new QueryCommand(params));

      const comments = result.Items.map((comment) => {
        return CommentFormatter(comment);
      });

      return comments;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get comments');
    }
  }

  async update(commentId: string, dto: UpdateCommentDto): Promise<Msg> {
    const params: UpdateItemCommandInput = {
      TableName: this.tableName,
      Key: {
        PK: { S: `COMMENT#${commentId}` },
        SK: { S: 'comment' },
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
        message: 'Comment updated successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async delete(commentId: string): Promise<Msg> {
    const params: DeleteItemCommandInput = {
      TableName: this.tableName,
      Key: {
        PK: { S: `COMMENT#${commentId}` },
        SK: { S: 'comment' },
      },
    };

    try {
      await ddbClient.send(new DeleteItemCommand(params));

      return {
        message: 'Comment deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}
