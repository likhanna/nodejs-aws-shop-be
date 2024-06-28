import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

interface ENV {
  PRODUCT_AWS_REGION: string;
  PRODUCTS_TABLE_NAME: string;
  STOCKS_TABLE_NAME: string;
}

const getConfig = (): ENV => {
  return {
    PRODUCT_AWS_REGION: process.env.REGION ?? 'eu-west-1',
    PRODUCTS_TABLE_NAME: process.env.PRODUCTS_TABLE_NAME ?? 'products',
    STOCKS_TABLE_NAME: process.env.STOCKS_TABLE_NAME ?? 'stocks',
  };
};

const config = getConfig();

export default config;
