import { BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { Product, Stock, mockProducts } from './mock-data';
import { randomUUID } from 'crypto';
import { dynamodb } from '.';

const prepareProducts = (): Product[] => {
  return mockProducts.map(({ title, description, price }) => ({
    id: randomUUID(),
    title: title,
    description: description,
    price: price,
  }));
};

const generateStockData = (products: Product[]): Stock[] => {
  return products.map(({ id }) => ({
    product_id: id,
    count: Math.floor(Math.random() * 10),
  }));
};

const fillDb = async (tableName: string, items: Record<string, string | number>[]) => {
  await dynamodb.send(
    new BatchWriteCommand({
      RequestItems: {
        [tableName]: items.map((item) => ({
          PutRequest: {
            Item: item,
          },
        })),
      },
    }),
  );
};

const products = prepareProducts();
const productsTableName = process.env.PRODUCTS_TABLE_NAME!;
fillDb(productsTableName, products)
  .then(() => console.log(`Data was successfully added to "${productsTableName}" table`))
  .catch((e) => console.error(e));

const stocks = generateStockData(products);
const stocksTableName = process.env.STOCKS_TABLE_NAME!;
fillDb(stocksTableName, stocks)
  .then(() => console.log(`Data was successfully added to "${stocksTableName}" table`))
  .catch((e) => console.error(e));
