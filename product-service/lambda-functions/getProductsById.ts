import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { Product, ProductStock, Stock } from './data/mock-data';
import { dynamodb } from './data';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ErrorMessages, HttpStatusCode, isValidUUID, prepareResponse } from './utils';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const productId = event.pathParameters?.productId;

  if (!productId) {
    return prepareResponse(HttpStatusCode.BAD_REQUEST, { message: ErrorMessages.MISSING_ID });
  }

  if (!isValidUUID(productId)) {
    return prepareResponse(HttpStatusCode.BAD_REQUEST, { message: ErrorMessages.INCORRECT_ID });
  }

  try {
    const product = await productStockById(productId);
    console.log('By id found product: ', product);

    if (product) {
      return prepareResponse(HttpStatusCode.OK, product);
    } else {
      return prepareResponse(HttpStatusCode.NOT_FOUND, { message: ErrorMessages.DOES_NOT_EXIST });
    }
  } catch (error) {
    return prepareResponse(HttpStatusCode.INTERNAL_SERVER_ERROR, { message: ErrorMessages.DB_ERROR });
  }
};

const productStockById = async (id: string): Promise<ProductStock | null> => {
  console.log('Requested id is: ', id);

  try {
    const { Item: productData } = await dynamodb.send(
      new GetCommand({
        TableName: process.env.PRODUCTS_TABLE_NAME,
        Key: { id },
      }),
    );

    const { Item: stockData } = await dynamodb.send(
      new GetCommand({
        TableName: process.env.STOCKS_TABLE_NAME,
        Key: { product_id: id },
      }),
    );

    if (!productData) {
      throw new Error(`Product with id ${id} not found`);
    }

    const product = productData as Product;
    let count = 0;
    if (stockData) {
      const stock = stockData as Stock;
      count = stock.count;
    }

    const productStock: ProductStock = {
      ...product,
      count,
    };

    return productStock;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching data from DynamoDB');
  }
};
