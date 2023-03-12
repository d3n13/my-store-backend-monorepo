import { s3Client } from "@libs/s3-client";

const AWS_S3_BUCKET_NAME = "import-service-csv-starage50830459";
const AWS_SIGNED_KEY_EXPIRES_IN_SEC = 3600;

export function importProductsFile(fileName: string) {
  const key = `uploaded/${fileName}`;
  const signedUrl = createPresignedUrlWithClient(key);
  return signedUrl;
}

function createPresignedUrlWithClient(key: string) {
  return s3Client.getSignedUrl("putObject", {
    Bucket: AWS_S3_BUCKET_NAME,
    Key: key,
    Expires: AWS_SIGNED_KEY_EXPIRES_IN_SEC,
  });
}
