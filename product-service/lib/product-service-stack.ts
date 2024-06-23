import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Cors } from 'aws-cdk-lib/aws-apigateway';
import { HttpMethod, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import config from '../config';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsListFunc = new lambda.Function(this, 'GetProductsListLambda', {
      runtime: Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda-functions'),
      handler: 'getProductsList.handler',
      environment: {
        PRODUCT_AWS_REGION: config.PRODUCT_AWS_REGION,
        PRODUCTS_TABLE_NAME: config.PRODUCTS_TABLE_NAME,
        STOCKS_TABLE_NAME: config.STOCKS_TABLE_NAME,
      },
    });

    const getProductsByIdFunc = new lambda.Function(this, 'GetProductsByIdLambda', {
      runtime: Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda-functions'),
      handler: 'getProductsById.handler',
      environment: {
        PRODUCT_AWS_REGION: config.PRODUCT_AWS_REGION,
        PRODUCTS_TABLE_NAME: config.PRODUCTS_TABLE_NAME,
        STOCKS_TABLE_NAME: config.STOCKS_TABLE_NAME,
      },
    });

    const createProductFunc = new lambda.Function(this, 'CreateProductLambda', {
      runtime: Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda-functions'),
      handler: 'createProduct.handler',
      environment: {
        PRODUCT_AWS_REGION: config.PRODUCT_AWS_REGION,
        PRODUCTS_TABLE_NAME: config.PRODUCTS_TABLE_NAME,
        STOCKS_TABLE_NAME: config.STOCKS_TABLE_NAME,
      },
    });

    const api = new apigateway.RestApi(this, 'ProductsApi', {
      restApiName: 'Products API',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowMethods: Cors.ALL_METHODS,
      },
    });

    const products = api.root.addResource('products');
    const productById = products.addResource('{productId}');

    products.addMethod(HttpMethod.GET, new apigateway.LambdaIntegration(getProductsListFunc));
    products.addMethod(HttpMethod.POST, new apigateway.LambdaIntegration(createProductFunc));
    productById.addMethod(HttpMethod.GET, new apigateway.LambdaIntegration(getProductsByIdFunc));

    const productsTable = Table.fromTableName(this, 'products', config.PRODUCTS_TABLE_NAME);

    productsTable.grantReadData(getProductsListFunc);
    productsTable.grantReadData(getProductsByIdFunc);
    productsTable.grantWriteData(createProductFunc);

    const stocksTable = Table.fromTableName(this, 'stocks', config.STOCKS_TABLE_NAME);

    stocksTable.grantReadData(getProductsListFunc);
    stocksTable.grantReadData(getProductsByIdFunc);
    stocksTable.grantWriteData(createProductFunc);
  }
}
