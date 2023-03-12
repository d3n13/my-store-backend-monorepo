import S3Client from "aws-sdk/clients/s3";

const AWS_REGION = "eu-west-2";

export const s3Client = new S3Client({ region: AWS_REGION });
