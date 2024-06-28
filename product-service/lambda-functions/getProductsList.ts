import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { ProductStock } from './data/mock-data';
import { dynamodb } from './data';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { ErrorMessages, HttpStatusCode, prepareResponse } from './utils';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const products: ProductStock[] = await availableProducts();

  if (!products.length) {
    return prepareResponse(HttpStatusCode.NOT_FOUND, { message: ErrorMessages.EMPTY_RESULT });
  }

  return prepareResponse(HttpStatusCode.OK, products);
};

const availableProducts = (): Promise<ProductStock[]> => {
  const productsPromise = dynamodb.send(
    new ScanCommand({
      TableName: process.env.PRODUCTS_TABLE_NAME,
    }),
  );

  const stocksPromise = dynamodb.send(
    new ScanCommand({
      TableName: process.env.STOCKS_TABLE_NAME,
    }),
  );

  return Promise.all([productsPromise, stocksPromise])
    .then(([productsResult, stocksResult]) => {
      const products = productsResult.Items?.map((item) => unmarshall(item)) ?? [];
      const stocks = stocksResult.Items?.map((item) => unmarshall(item)) ?? [];

      const stockMap = new Map<string, number>();
      stocks.forEach((stock) => {
        stockMap.set(stock.product_id, stock.count);
      });

      const combinedResults: ProductStock[] = products.map((product) => ({
        id: product.id,
        count: stockMap.get(product.id) || 0,
        price: product.price,
        title: product.title,
        description: product.description,
      }));

      console.log('Fetched data from DynamoDB: ', combinedResults);
      return combinedResults ?? [];
    })
    .catch((error) => {
      console.error('Error fetching data from DynamoDB: ', error);
      throw error;
    });
};
