import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, "body"> & {
  body: FromSchema<S>;
};
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>;

const ALLOWED_ORIGINS_MAP = {
  "https://d1hip2isccotrp.cloudfront.net": true,
  "http://localhost:3000": true,
  "https://editor.swagger.io": true,
};

export function formatJSONResponse(response: any, origin: string) {
  return formatTextResponse(JSON.stringify(response), origin);
}

export function formatTextResponse(response: string, origin: string) {
  return {
    statusCode: 200,
    body: response,
    headers: getCORSHeaders(origin),
  };
}

function getCORSHeaders(origin: string) {
  if (isNotAllowedOrigin(origin)) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": true,
  };
}

function isAllowedOrigin(origin: string) {
  return !!ALLOWED_ORIGINS_MAP[origin];
}
function isNotAllowedOrigin(origin: string) {
  return !isAllowedOrigin(origin);
}
