import * as cdk from 'aws-cdk-lib';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Cors } from 'aws-cdk-lib/aws-apigateway';
import { HttpMethod, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const getProductsListFunc = new lambda.Function(this, 'GetProductsListLambda', {
      runtime: Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda-functions"),
      handler: 'getProductsList.handler',
    });
    
    const getProductsByIdFunc = new lambda.Function(this, 'GetProductsByIdLambda', {
      runtime: Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda-functions"),
      handler: 'getProductsById.handler',  
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
    productById.addMethod(HttpMethod.GET, new apigateway.LambdaIntegration(getProductsByIdFunc));
  }
}
