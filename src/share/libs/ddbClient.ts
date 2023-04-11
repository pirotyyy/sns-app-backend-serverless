import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// export const ddbClient = new DynamoDBClient({
//   region: 'localhost',
//   endpoint: 'http://localhost:8082',
// });

export const ddbClient = new DynamoDBClient({
  region: 'ap-northeast-1',
});
