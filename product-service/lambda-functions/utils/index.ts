import { APIGatewayProxyResult } from 'aws-lambda';

export const basicHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
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
  INVALID_HTTP_METHOD = 'Invalid HTTP method',
  MISSING_ID = 'Product id is not provided',
  INCORRECT_ID = 'Product id is incorrect',
  MISSING_BODY = 'Required request body is missing',
  BODY_INVALID = 'The provided body does not match the expected schema',
  DOES_NOT_EXIST = "Product with requested id doesn't exist",
  EMPTY_RESULT = 'No products found',
  DB_ERROR = 'A database operation failed while processing the request',
  GENERIC_ERROR = 'Internal server error',
}

export const prepareResponse = (statusCode: number, body: any): APIGatewayProxyResult => ({
  statusCode,
  headers: basicHeaders,
  body: JSON.stringify(body),
});

export const isValidUUID = (uuid: string): boolean => {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(uuid);
};
