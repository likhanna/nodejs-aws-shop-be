import { handler } from "../lambda-functions/importProductsFile";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

jest.mock("@aws-sdk/client-s3");
jest.mock("@aws-sdk/s3-request-presigner");

describe("importProductsFile Lambda Function", () => {
  const mockS3Client = S3Client as jest.MockedClass<typeof S3Client>;
  const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<
    typeof getSignedUrl
  >;

  beforeEach(() => {
    mockS3Client.mockClear();
    mockGetSignedUrl.mockClear();
  });

  it("should return a signed URL for a valid request", async () => {
    const event = {
      queryStringParameters: { name: "test.csv" },
    } as unknown as APIGatewayProxyEvent;

    mockGetSignedUrl.mockResolvedValue("https://signedurl-mocked");

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe('"https://signedurl-mocked"');
  });

  it("should return status 400 if file name is not provided", async () => {
    const event = {} as APIGatewayProxyEvent;
    const context = {} as Context;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toBe(
      JSON.stringify({ message: "File name is not provided" })
    );
  });
});
