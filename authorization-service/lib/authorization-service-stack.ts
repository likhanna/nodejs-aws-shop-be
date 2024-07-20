import * as cdk from "aws-cdk-lib";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Runtime, Function, Code } from "aws-cdk-lib/aws-lambda";

import { Construct } from "constructs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const basicAuthorizer = new Function(this, "BasicAuthorizerLambda", {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset("lambda-functions"),
      handler: "basicAuthorizer.handler",
      environment: {
        PRODUCT_AWS_REGION: process.env.REGION!,
      },
      functionName: "BasicAuthorizerLambda",
    });

    basicAuthorizer.grantInvoke(
      new ServicePrincipal("apigateway.amazonaws.com")
    );
  }
}
