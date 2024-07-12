import { S3Event } from "aws-lambda";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { catalogItemsQueueUrl, ErrorMessages, region } from "./utils/index";
import { Readable } from "stream";
import csvParser = require("csv-parser");

export const handler = async (event: S3Event): Promise<void> => {
  console.log(`importFileParserLambda event: ${JSON.stringify(event)}`);

  const record = event.Records[0];
  const bucketName = record.s3.bucket.name;
  const key = record.s3.object.key;

  console.log(`File ${key} successfully uploaded to ${bucketName}`);

  const s3client = new S3Client({ region });
  const sqsClient = new SQSClient({ region });

  try {
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const destKey = key.replace("uploaded/", "parsed/");

    const copyCommand = new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${key}`,
      Key: destKey,
    });

    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const { Body: readableStream } = await s3client.send(getCommand);

    if (readableStream instanceof Readable) {
      readableStream
        .pipe(csvParser())
        .on("data", async (data) => {
          const snsParams = {
            QueueUrl: catalogItemsQueueUrl,
            MessageBody: JSON.stringify(data),
          };

          try {
            await sqsClient.send(new SendMessageCommand(snsParams));
          } catch (error) {
            console.error("SQS error: ", error);
          }
        })
        .on("end", () => {
          console.log("CSV parsing completed.");
        });
    } else {
      throw new Error(ErrorMessages.STREAM_ERROR_MISSING);
    }

    await s3client.send(copyCommand);
    await s3client.send(deleteCommand);
    console.log('CSV moved from "uploaded" to "parsed" directory');
  } catch (error) {
    console.error("Error", error);
  }
};
