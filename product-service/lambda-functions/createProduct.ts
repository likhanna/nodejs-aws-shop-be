import { randomUUID } from 'crypto';
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { NewProduct, ProductStock } from './data/mock-data';
import { dynamodb } from './data';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { ErrorMessages, HttpStatusCode, prepareResponse } from './utils';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log(`createProduct lambda event: ${JSON.stringify(event)}`);

  try {
    const body = event.body;

    if (!body || !isNewProductValid(body)) {
      return prepareResponse(HttpStatusCode.BAD_REQUEST, { message: ErrorMessages.BODY_INVALID });
    }

    const payload = JSON.parse(body) as NewProduct;

    switch (event.httpMethod) {
      case 'POST': {
        const product = await createProduct(payload);

        return prepareResponse(HttpStatusCode.OK, { product: product });
      }
      default: {
        return prepareResponse(HttpStatusCode.METHOD_NOT_ALLOWED, { message: ErrorMessages.INVALID_HTTP_METHOD });
      }
    }
  } catch (error) {
    return prepareResponse(HttpStatusCode.INTERNAL_SERVER_ERROR, { message: ErrorMessages.DB_ERROR });
  }
};

const createProduct = (data: NewProduct): Promise<ProductStock | void> => {
  const id = randomUUID();
  const newProductPromise = dynamodb.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: process.env.PRODUCTS_TABLE_NAME,
            Item: {
              ...data,
              id,
            },
          },
        },
        {
          Put: {
            TableName: process.env.STOCKS_TABLE_NAME,
            Item: {
              product_id: id,
              count: data.count,
            },
          },
        },
      ],
    }),
  );

  return newProductPromise
    .then(() => {
      console.log(`New product with id=${id} and title=${data.title} was created successfully`);
      return { id, ...data };
    })
    .catch((error) => {
      console.error('Some error at creating new product', error);
      throw error;
    });
};

const isNewProductValid = (body: string) => {
  const newProduct = JSON.parse(body);
  const { title, description, price, count } = newProduct;

  return (
    typeof title === 'string' &&
    typeof description === 'string' &&
    typeof price === 'number' &&
    typeof count === 'number'
  );
};
