import { handlerPath } from "@libs/handler-resolver";
import { ValueOf } from "@libs/types";
import type { AWS } from "@serverless/typescript";

const awsFunction: ValueOf<AWS["functions"]> = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "/import",
        cors: true,
        request: {
          parameters: {
            querystrings: {
              name: { required: true },
            },
          },
        },
      },
    },
  ],
};

export default awsFunction;
