import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  ErrorMessages,
  HttpStatusCode,
  bucketName,
  prefix,
  prepareResponse,
  region,
} from "./utils";

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log(`importProductsFileLambda event: ${JSON.stringify(event)}`);

  const fileName = event.queryStringParameters?.name;
  if (!fileName) {
    return prepareResponse(HttpStatusCode.BAD_REQUEST, {
      message: ErrorMessages.MISSING_FILE_NAME,
    });
  }
  const client = new S3Client({ region });
  const key = `${prefix}${fileName}`;
  const params = {
    Bucket: bucketName,
    Key: key,
    ContentType: "text/csv",
  };

  try {
    const signedUrl = await getSignedUrl(client, new PutObjectCommand(params), {
      expiresIn: 3600,
    });

    return prepareResponse(HttpStatusCode.OK, signedUrl);
  } catch (err) {
    return prepareResponse(HttpStatusCode.INTERNAL_SERVER_ERROR, {
      message: ErrorMessages.GENERIC_ERROR,
    });
  }
};
