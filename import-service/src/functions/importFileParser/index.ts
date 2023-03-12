import { handlerPath } from "@libs/handler-resolver";
import { ValueOf } from "@libs/types";
import type { AWS } from "@serverless/typescript";

const awsFunction: ValueOf<AWS["functions"]> = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: "import-service-csv-starage50830459",
        existing: true,
        event: "s3:ObjectCreated:*",
        rules: [{ prefix: "uploaded/" }],
      },
    },
  ],
};

export default awsFunction;
