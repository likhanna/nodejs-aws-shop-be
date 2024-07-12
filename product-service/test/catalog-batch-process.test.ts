import { SQSEvent, SQSRecord } from 'aws-lambda';
import { SNSClient } from '@aws-sdk/client-sns';
import { handler } from '../lambda-functions/catalogBatchProcess';
import { dynamodb } from '../lambda-functions/data';

// Mock dependencies
jest.mock('@aws-sdk/client-sns');
jest.mock('@aws-sdk/lib-dynamodb');
jest.mock('./data', () => ({
  dynamodb: {
    send: jest.fn(),
  },
}));

const mockSNSClient = SNSClient as jest.MockedClass<typeof SNSClient>;

describe('catalogBatchProcess Lambda', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process valid products and publish SNS message', async () => {
    const mockProduct = {
      title: 'Blender',
      description: 'High-speed kitchen blender',
      price: '99.99',
      count: '50',
    };

    const mockSQSRecord: SQSRecord = {
      body: JSON.stringify(mockProduct),
      messageId: '1',
      receiptHandle: '2',
      attributes: {},
      messageAttributes: {},
      md5OfBody: '',
      eventSource: '',
      eventSourceARN: '',
      awsRegion: '',
    };

    const event: SQSEvent = {
      Records: [mockSQSRecord],
    };

    (dynamodb.send as jest.Mock).mockResolvedValueOnce({});
    mockSNSClient.prototype.send = jest.fn().mockResolvedValueOnce({});

    const response = await handler(event);

    expect(dynamodb.send).toHaveBeenCalledTimes(1);
    expect(mockSNSClient.prototype.send).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toBe(200);
  });

  it('should return BAD_REQUEST if product is invalid', async () => {
    const mockProduct = {
      title: '',
      description: 'High-speed kitchen blender',
      price: '99.99',
      count: '50',
    };

    const mockSQSRecord: SQSRecord = {
      body: JSON.stringify(mockProduct),
      messageId: '1',
      receiptHandle: '2',
      attributes: {},
      messageAttributes: {},
      md5OfBody: '',
      eventSource: '',
      eventSourceARN: '',
      awsRegion: '',
    };

    const event: SQSEvent = {
      Records: [mockSQSRecord],
    };

    const response = await handler(event);

    expect(dynamodb.send).not.toHaveBeenCalled();
    expect(mockSNSClient.prototype.send).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  it('should return INTERNAL_SERVER_ERROR if dynamoDB operation fails', async () => {
    const mockProduct = {
      title: 'Blender',
      description: 'High-speed kitchen blender',
      price: '99.99',
      count: '50',
    };

    const mockSQSRecord: SQSRecord = {
      body: JSON.stringify(mockProduct),
      messageId: '1',
      receiptHandle: '2',
      attributes: {},
      messageAttributes: {},
      md5OfBody: '',
      eventSource: '',
      eventSourceARN: '',
      awsRegion: '',
    };

    const event: SQSEvent = {
      Records: [mockSQSRecord],
    };

    (dynamodb.send as jest.Mock).mockRejectedValueOnce(new Error('DynamoDB Error'));

    const response = await handler(event);

    expect(dynamodb.send).toHaveBeenCalledTimes(1);
    expect(mockSNSClient.prototype.send).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  it('should return INTERNAL_SERVER_ERROR if SNS publish fails', async () => {
    const mockProduct = {
      title: 'Blender',
      description: 'High-speed kitchen blender',
      price: '99.99',
      count: '50',
    };

    const mockSQSRecord: SQSRecord = {
      body: JSON.stringify(mockProduct),
      messageId: '1',
      receiptHandle: '2',
      attributes: {},
      messageAttributes: {},
      md5OfBody: '',
      eventSource: '',
      eventSourceARN: '',
      awsRegion: '',
    };

    const event: SQSEvent = {
      Records: [mockSQSRecord],
    };

    (dynamodb.send as jest.Mock).mockResolvedValueOnce({});
    mockSNSClient.prototype.send = jest.fn().mockRejectedValueOnce(new Error('SNS Error'));

    const response = await handler(event);

    expect(dynamodb.send).toHaveBeenCalledTimes(1);
    expect(mockSNSClient.prototype.send).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toBe(500);
  });
});
