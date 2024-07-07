import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

interface ENV {
  PRODUCT_AWS_REGION: string;
  PRODUCTS_TABLE_NAME: string;
  STOCKS_TABLE_NAME: string;
  EMAIL: string;
  BATCH_SIZE: string;
  IMPORT_PRODUCTS_TOPIC_ARN: string;
}

const getConfig = (): ENV => {
  return {
    PRODUCT_AWS_REGION: process.env.REGION ?? 'eu-west-1',
    PRODUCTS_TABLE_NAME: process.env.PRODUCTS_TABLE_NAME ?? 'products',
    STOCKS_TABLE_NAME: process.env.STOCKS_TABLE_NAME ?? 'stocks',
    EMAIL: process.env.EMAIL ?? 'khlr@list.ru',
    BATCH_SIZE: process.env.BATCH_SIZE ?? '5',
    IMPORT_PRODUCTS_TOPIC_ARN:
      process.env.IMPORT_PRODUCTS_TOPIC_ARN ?? 'arn:aws:sns:eu-west-1:654654438735:import-products-topic',
  };
};

const config = getConfig();

export default config;
