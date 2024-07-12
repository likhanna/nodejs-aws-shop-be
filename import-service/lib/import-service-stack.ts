import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { HttpMethod, Runtime } from "aws-cdk-lib/aws-lambda";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import {
  bucketName,
  catalogItemsQueueArn,
  prefix,
  region,
} from "../lambda-functions/utils";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = Bucket.fromBucketName(this, "ImportBucket", bucketName);
    const queue = Queue.fromQueueArn(
      this,
      "CatalogItemsQueue",
      catalogItemsQueueArn
    );

    const importProductsFile = new lambda.Function(
      this,
      "importProductsFileLambda",
      {
        runtime: Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset("lambda-functions"),
        handler: "importProductsFile.handler",
        environment: {
          PRODUCT_AWS_REGION: region,
          BUCKET_NAME: bucket.bucketName,
        },
      }
    );

    const importFileParser = new lambda.Function(
      this,
      "importFileParserLambda",
      {
        runtime: Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset("lambda-functions"),
        handler: "importFileParser.handler",
        environment: {
          PRODUCT_AWS_REGION: region,
          BUCKET_NAME: bucket.bucketName,
          QUEUE_URL: queue.queueUrl,
        },
      }
    );

    const api = new RestApi(this, "importApi", {
      restApiName: "Import API",
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowMethods: Cors.ALL_METHODS,
      },
    });

    const importResource = api.root.addResource("import");
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
