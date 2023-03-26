import type { AWS } from "@serverless/typescript";

import getProductsList from "@functions/getProductsList";
import getProductsById from "@functions/getProductsById";
import createProduct from "@functions/createProduct";
import catalogBatchProcess from "@functions/catalogBatchProcess";
import { PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME } from "@libs/env";

const serverlessConfiguration: AWS = {
  service: "product-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-dynamodb-seed"],
  provider: {
    name: "aws",
    region: "eu-west-2",
    runtime: "nodejs14.x",
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:DescribeTable",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:BatchGetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
        ],
        Resource: "*",
      },
      {
        Effect: "Allow",
        Action: ["sns:Publish"],
        Resource: ["arn:aws:sns:::createProductTopic"],
      },
    ],
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
  },
  functions: {
    createProduct,
    getProductsList,
    getProductsById,
    catalogBatchProcess,
  },
  package: { individually: true },
  resources: {
    Resources: {
      createProductTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: "createProductTopic",
        },
      },
      emailSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Protocol: "Email",
          Endpoint:
            process.env.AWS_PRODUCT_SERVICE_CREATE_PRODUCT_NOTIFICATION_EMAIL,
          TopicArn: {
            Ref: "createProductTopic",
          },
        },
      },
      awesoneEmailSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Protocol: "Email",
          Endpoint:
            process.env
              .AWS_PRODUCT_SERVICE_CREATE_AWESOME_PRODUCT_NOTIFICATION_EMAIL,
          TopicArn: {
            Ref: "createProductTopic",
          },
          FilterPolicyScope: "MessageBody",
          FilterPolicy: { awesome: ["awesome"] },
        },
      },
      catalogItemsQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "catalogItemsQueue",
        },
      },
      productsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: PRODUCTS_TABLE_NAME,
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
      stocksTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: STOCKS_TABLE_NAME,
          AttributeDefinitions: [
            {
              AttributeName: "product_id",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "product_id",
              KeyType: "HASH",
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
    },
  },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    seed: {
      seedProducts: {
        table: "products",
        sources: ["./db-seeds/products.json"],
      },
      seedStocks: {
        table: "stocks",
        sources: ["./db-seeds/stocks.json"],
      },
    },
  },
};

module.exports = serverlessConfiguration;
