import * as cdk from "aws-cdk-lib";
import {
  Cors,
  IdentitySource,
  LambdaIntegration,
  ResponseType,
  RestApi,
  TokenAuthorizer,
} from "aws-cdk-lib/aws-apigateway";
import { HttpMethod, Runtime, Function, Code } from "aws-cdk-lib/aws-lambda";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import {
  authorizerHeaders,
  basicAuthorizerFuncName,
  bucketName,
  catalogItemsQueueArn,
  HttpStatusCode,
  prefix,
  region,
} from "../lambda-functions/utils";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = Bucket.fromBucketName(this, "ImportBucket", bucketName);
    const queue = Queue.fromQueueArn(
      this,
      "CatalogItemsQueue",
      catalogItemsQueueArn
    );
    const basicAuthorizerFunction = Function.fromFunctionName(
      this,
      "BasicAuthorizerLambda",
      basicAuthorizerFuncName
    );

    const importProductsFile = new Function(this, "importProductsFileLambda", {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset("lambda-functions"),
      handler: "importProductsFile.handler",
      environment: {
        PRODUCT_AWS_REGION: region,
        BUCKET_NAME: bucket.bucketName,
      },
    });

    const importFileParser = new Function(this, "importFileParserLambda", {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset("lambda-functions"),
      handler: "importFileParser.handler",
      environment: {
        PRODUCT_AWS_REGION: region,
        BUCKET_NAME: bucket.bucketName,
        QUEUE_URL: queue.queueUrl,
      },
    });

    const api = new RestApi(this, "importApi", {
      restApiName: "Import API",
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowMethods: Cors.ALL_METHODS,
        allowCredentials: true,
      },
    });

    const importResource = api.root.addResource("import");

    api.addGatewayResponse("ImportProductsFileUnauthorized", {
      type: ResponseType.UNAUTHORIZED,
      statusCode: `${HttpStatusCode.UNAUTHORIZED}`,
      responseHeaders: authorizerHeaders,
    });

    api.addGatewayResponse("ImportProductsFileForbidden", {
      type: ResponseType.ACCESS_DENIED,
      statusCode: `${HttpStatusCode.FORBIDDEN}`,
      responseHeaders: authorizerHeaders,
    });

    const authRole = new Role(this, "ImportProductsFileAuthorizerRole", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
    });

    authRole.addToPolicy(
      new PolicyStatement({
        actions: ["lambda:InvokeFunction"],
        resources: [basicAuthorizerFunction.functionArn],
      })
    );

    const authorizer = new TokenAuthorizer(this, "ApiAuthorizer", {
      handler: basicAuthorizerFunction,
      assumeRole: authRole,
      identitySource: IdentitySource.header("Authorization"),
    });

    importResource.addMethod(
      HttpMethod.GET,
      new LambdaIntegration(importProductsFile),
      {
        requestParameters: {
          "method.request.querystring.name": true,
        },
        requestValidatorOptions: {
          validateRequestParameters: true,
        },
        authorizer: authorizer,
      }
    );

    bucket.grantReadWrite(importProductsFile);
    bucket.grantReadWrite(importFileParser);

    bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(importFileParser),
      {
        prefix: prefix,
      }
    );

    queue.grantSendMessages(importFileParser);
  }
}
