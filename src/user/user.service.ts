import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { ddbClient } from 'src/share/libs/ddbClient';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ConditionalCheckFailedException,
  DeleteItemCommand,
  DeleteItemCommandInput,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
  TransactWriteItemsCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { UpdateUserDto } from './dto/update-user.dto';
import { Msg } from 'src/share/interfaces/msg.interface';
import { UserFormatter } from './formatters/user.formatter';
import { User } from 'src/share/models/user.model';

@Injectable()
export class UserService {
  private readonly tableName = process.env.TABLE_NAME;

  // ユーザーの作成
  async create(dto: CreateUserDto): Promise<Msg> {
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const params: PutItemCommandInput = {
      TableName: this.tableName,
      Item: {
        PK: { S: `@${dto.userId}` },
        SK: { S: 'user' },
        Username: { S: dto.username },
        HashedPassword: { S: hashedPassword },
        Email: { S: dto.email },
        Profile: { S: '' },
      },
      ConditionExpression: 'attribute_not_exists(SK)',
    };

    try {
      await ddbClient.send(new PutItemCommand(params));

      return {
        message: 'User created successfully',
      };
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new BadRequestException(`${dto.userId} already used`);
      }
      throw new InternalServerErrorException();
    }
  }

  // ユーザー一覧の取得
  async getAll(): Promise<Omit<User, 'hashedPassword'>[]> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: 'SK-PK-index',
      KeyConditionExpression: 'begins_with(#PK, :pk) and #SK = :sk',
      ExpressionAttributeNames: {
        '#PK': 'PK',
        '#SK': 'SK',
      },
      ExpressionAttributeValues: {
        ':pk': { S: '@' },
        ':sk': { S: 'user' },
      },
    };

    try {
      const result = await ddbClient.send(new QueryCommand(params));

      const users = result.Items.map((user) => {
        return UserFormatter(user);
      });

      return users;
    } catch (error) {
      throw new InternalServerErrorException('Faild to get users');
    }
  }

  // 特定のユーザーの取得
  async getById(userId: string): Promise<Omit<User, 'hashedPassword'>> {
    const params: GetItemCommandInput = {
      TableName: this.tableName,
      Key: {
        PK: { S: `@${userId}` },
        SK: { S: 'user' },
      },
    };

    try {
      const result = await ddbClient.send(new GetItemCommand(params));
      const user = UserFormatter(result.Item);

      return user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get user');
    }
  }

  // ユーザー情報の更新
  async update(userId: string, dto: UpdateUserDto): Promise<Msg> {
    const params: UpdateItemCommandInput = {
      TableName: this.tableName,
      Key: {
        PK: { S: `@${userId}` },
        SK: { S: 'user' },
      },
      UpdateExpression: 'set #Username = :username',
      ExpressionAttributeNames: {
        '#Username': 'Username',
      },
      ExpressionAttributeValues: {
        ':username': { S: dto.username },
      },
    };

    try {
      await ddbClient.send(new UpdateItemCommand(params));

      return {
        message: 'User updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update');
    }
  }

  // ユーザーの削除
  async delete(userId: string): Promise<Msg> {
    const params: DeleteItemCommandInput = {
      TableName: this.tableName,
      Key: {
        PK: { S: `@${userId}` },
        SK: { S: 'user' },
      },
    };

    try {
      await ddbClient.send(new DeleteItemCommand(params));

      return {
        message: 'User deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete');
    }
  }
}
