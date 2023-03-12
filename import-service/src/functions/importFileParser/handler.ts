import { s3Client } from "@libs/s3-client";
import parseCsv from "csv-parser";

const AWS_S3_BUCKET_NAME = "import-service-csv-starage50830459";

type S3ObjectRecord = {
  eventVersion: string;
  eventSource: string;
  awsRegion: string;
  eventTime: string;
  eventName: string;
  userIdentity: {
    principalId: string;
  };
  requestParameters: {
    sourceIPAddress: string;
  };
  responseElements: {
    "x-amz-request-id": string;
    "x-amz-id-2": string;
  };
  s3: {
    s3SchemaVersion: string;
    configurationId: string;
    bucket: {
      name: string;
      ownerIdentity: {
        principalId: string;
      };
      arn: string;
    };
    object: {
      key: string;
      size: number;
      eTag: string;
      sequencer: string;
    };
  };
};

const importFileParser = async (event: { Records: S3ObjectRecord[] }) => {
  console.log(JSON.stringify(event));

  const { Records } = event;

  await Promise.all(
    Records.map(
      ({ s3: { bucket, object } }) =>
        new Promise<void>((resolve, reject) =>
          s3Client
            .getObject({
              Bucket: bucket.name,
              Key: object.key,
            })
            .createReadStream()
            .pipe(parseCsv())
            .on("error", (err) => reject(err))
            .on("data", (data) => console.log(JSON.stringify(data)))
            .on("end", async () => {
              await s3Client
                .copyObject({
                  CopySource: `${bucket.name}/${object.key}`,
                  Bucket: bucket.name,
                  Key: object.key.replace("uploaded/", "parsed/"),
                })
                .promise();

              await s3Client
                .deleteObject({
                  Bucket: AWS_S3_BUCKET_NAME,
                  Key: object.key,
                })
                .promise();

              resolve();
            })
        )
    )
  );
};

export const main = importFileParser;
