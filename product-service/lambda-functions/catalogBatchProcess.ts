import { APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

import { ErrorMessages, HttpStatusCode, prepareResponse } from './utils';
import { NewProduct, ProductStock } from './data/mock-data';
import { randomUUID } from 'crypto';
import { dynamodb } from './data';
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: SQSEvent): Promise<APIGatewayProxyResult> => {
  console.log(`catalogBatchProcessLambda event: ${JSON.stringify(event)}`);

  try {
    const records = event.Records;
    const snsClient = new SNSClient({ region: process.env.REGION ?? 'eu-west-1' });

    for (const item of records) {
      const { body } = item;

      if (!body) {
        return prepareResponse(HttpStatusCode.BAD_REQUEST, { message: ErrorMessages.MISSING_BODY });
      }

      const parsedBody = JSON.parse(body);

      if (!isNewProductValid(parsedBody)) {
        return prepareResponse(HttpStatusCode.BAD_REQUEST, { message: ErrorMessages.BODY_INVALID });
      }

      const product = await createProduct(parsedBody);

      await snsClient.send(
        new PublishCommand({
          Subject: 'New products have been imported',
          TopicArn: process.env.IMPORT_PRODUCTS_TOPIC_ARN ?? 'arn:aws:sns:eu-west-1:654654438735:import-products-topic',
          Message: JSON.stringify(product),
          MessageAttributes: {
            count: {
              DataType: 'Number',
              StringValue: `${product?.count}`,
            },
          },
        }),
      );
    }

    return prepareResponse(HttpStatusCode.OK, records);
  } catch (e) {
    return prepareResponse(HttpStatusCode.INTERNAL_SERVER_ERROR, { message: ErrorMessages.GENERIC_ERROR });
  }
};

const createProduct = (data: NewProduct): Promise<ProductStock | void> => {
  const id = randomUUID();
  const { title, description, price, count } = data;

  const newProductPromise = dynamodb.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: process.env.PRODUCTS_TABLE_NAME ?? 'products',
            Item: {
              id,
              title,
              description,
              price,
            },
          },
        },
        {
          Put: {
            TableName: process.env.STOCKS_TABLE_NAME ?? 'stocks',
            Item: {
              product_id: id,
              count,
            },
          },
        },
      ],
    }),
  );

  return newProductPromise
    .then(() => {
      console.log(`New product with id=${id} and title=${title} was created successfully`);
      return { id, ...data };
    })
    .catch((error) => {
      console.error('Some error at creating new product', error);
      throw error;
    });
};

const isNewProductValid = (product: any) => {
  const { title, description, price, count } = product;
  const priceNumber = parseFloat(price);
  const countNumber = parseInt(count, 10);

  const isValid =
    title &&
    typeof title === 'string' &&
    description &&
    typeof description === 'string' &&
    !isNaN(priceNumber) &&
    priceNumber > 0 &&
    !isNaN(countNumber) &&
    countNumber >= 0;
  console.log(`Validation result for product: ${isValid}`, product);
  return isValid;
};
