import { APIGatewayProxyResult } from "aws-lambda";

export const basicHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Credentials": true,
};

export enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  UNPROCESSABLE_CONTENT = 422,
  INTERNAL_SERVER_ERROR = 500,
}

export enum ErrorMessages {
  TOKEN_INVALID = "Invalid token",
  UNAUTHORIZED = "Unauthorized",
  FORBIDDEN = "Forbidden",
}

export const prepareResponse = (
  statusCode: number,
  body: any
): APIGatewayProxyResult => ({
  statusCode,
  headers: basicHeaders,
  body: JSON.stringify(body),
});
