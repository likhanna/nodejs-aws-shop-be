import { handler } from "../lambda-functions/importFileParser";
import { S3Event } from "aws-lambda";
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

jest.mock("@aws-sdk/client-s3");

describe("importFileParser Lambda Function", () => {
  const mockS3Client = S3Client as jest.MockedClass<typeof S3Client>;
  const mockSend = jest.fn();

  beforeEach(() => {
    mockS3Client.mockClear();
    mockSend.mockClear();
    mockS3Client.prototype.send = mockSend;
  });

  it("should parse CSV file and move it to parsed directory", async () => {
    const event = {
      Records: [
        {
          s3: {
            bucket: { name: "test-bucket" },
            object: { key: "uploaded/test.csv" },
          },
        },
      ],
    } as S3Event;

    const readableStream = new Readable();
    readableStream.push(
      "title,description,price,count\nBlender,High-speed kitchen blender with multiple settings,99.99,50\n"
    );
    readableStream.push(null);

    mockSend.mockImplementation((command) => {
      if (command instanceof GetObjectCommand) {
        return { Body: readableStream };
      }
      return {};
    });

    await handler(event);

    expect(mockSend).toHaveBeenCalledWith(expect.any(GetObjectCommand));
    expect(mockSend).toHaveBeenCalledWith(expect.any(CopyObjectCommand));
    expect(mockSend).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
  });
});
