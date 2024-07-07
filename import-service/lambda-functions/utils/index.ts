import { APIGatewayProxyResult } from "aws-lambda";

export const region = process.env.REGION ?? "eu-west-1";
export const bucketName =
  process.env.BUCKET_NAME ?? "import-service-bucket-task5";
export const prefix = process.env.PREFIX ?? "uploaded/";
export const catalogItemsQueueArn =
  process.env.CATALOG_ITEMS_QUEUE_ARN ??
  "arn:aws:sqs:eu-west-1:654654438735:catalog-items-queue";
export const catalogItemsQueueUrl =
  process.env.QUEUE_URL ??
  "https://sqs.eu-west-1.amazonaws.com/654654438735/catalog-items-queue";

export const basicHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Headers":
    "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token",
};

export enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  UNPROCESSABLE_CONTENT = 422,
  INTERNAL_SERVER_ERROR = 500,
}

export enum ErrorMessages {
  INVALID_HTTP_METHOD = "Invalid HTTP method",
  MISSING_FILE_NAME = "File name is not provided",
  GENERIC_ERROR = "Internal server error",
  S3_CLIENT_ERROR = "A database operation failed while processing the request.",
  STREAM_ERROR_MISSING = "Stream Readable object is missing",
  STREAM_ERROR_PARSING = "CSV file parsing error",
}

export const prepareResponse = (
  statusCode: number,
  body: any
): APIGatewayProxyResult => ({
  statusCode,
  headers: basicHeaders,
  body: JSON.stringify(body),
});
