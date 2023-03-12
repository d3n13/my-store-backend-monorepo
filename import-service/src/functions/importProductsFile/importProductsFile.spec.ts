import * as AWSMock from "aws-sdk-mock";

import * as AWS from "aws-sdk";

import { importProductsFile } from "./importProductsFile";

beforeAll(() => {
  AWSMock.setSDKInstance(AWS);
});

afterAll(() => {
  AWSMock.restore();
});

describe("importProductsFile", () => {
  it("Should not throw", () => {
    expect(() => importProductsFile("file.csv")).not.toThrow();
  });

  it("Should return a string", () => {
    expect(typeof importProductsFile("file.csv")).toBe("string");
  });

  it("Should return a URL", () => {
    expect(() => {
      new URL(importProductsFile("file.csv"));
    }).not.toThrow();
  });

  it("Should expire in 3600", () => {
    const url = new URL(importProductsFile("file.csv"));

    expect(url.searchParams.get("X-Amz-Expires")).toBe("3600");
  });

  it("Should be AWS4-HMAC-SHA256 algorithm", () => {
    const url = new URL(importProductsFile("file.csv"));

    expect(url.searchParams.get("X-Amz-Algorithm")).toBe("AWS4-HMAC-SHA256");
  });
});
