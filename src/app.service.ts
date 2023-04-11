import { DeleteTableCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { ddbClient } from './share/libs/ddbClient';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async deleteTable(tableName: string) {
    const params = {
      TableName: tableName,
    };

    try {
      const result = await ddbClient.send(new DeleteTableCommand(params));

      return result;
    } catch (error) {
      return error;
    }
  }

  async scanTable(tableName: string) {
    const params = {
      TableName: tableName,
    };

    try {
      const result = await ddbClient.send(new ScanCommand(params));

      return result.Items;
    } catch (error) {
      throw error;
    }
  }
}
