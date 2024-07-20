import {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from "aws-lambda";
import { Effect } from "aws-cdk-lib/aws-iam";
import * as dotenv from "dotenv";

dotenv.config();

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  console.log(`basicAuthorizerLambda event: ${JSON.stringify(event)}`);
  let policy: APIGatewayAuthorizerResult;

  try {
    const { authorizationToken } = event;
    console.log("+++ authorizationHeaderData", authorizationToken);

    if (!authorizationToken || event.type !== "TOKEN") {
      policy = generatePolicy(
        "Unauthorized user",
        Effect.DENY,
        event.methodArn
      );
      return policy;
    }

    const token = authorizationToken.split(" ")[1];
    const encodedToken = Buffer.from(token, "base64").toString("utf-8");
    const [userName, password] = encodedToken.split(":");
    const correctPassword = process.env[userName];

    const effect =
      password !== correctPassword || !correctPassword
        ? Effect.DENY
        : Effect.ALLOW;
    console.log("Effect is ", effect);
    policy = generatePolicy(userName, effect, event.methodArn);

    return policy;
  } catch (err) {
    policy = generatePolicy("Unauthorized user", Effect.DENY, event.methodArn);
    return policy;
  }
};

const generatePolicy = (
  principalId: string,
  effect: Effect,
  resource: string
): APIGatewayAuthorizerResult => {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};
