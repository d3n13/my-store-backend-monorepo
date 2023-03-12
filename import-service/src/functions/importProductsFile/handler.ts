import { middyfy } from "@libs/lambda";
import { importProductsFile } from "./importProductsFile";
import {
  formatTextResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";

const handler: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {
  const fileName = event.queryStringParameters.name;
  const origin = event.headers.origin;
  const signedUrl = importProductsFile(fileName);
  return formatTextResponse(signedUrl, origin);
};

export const main = middyfy(handler);
