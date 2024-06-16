import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { handler } from "../lambda-functions/getProductsList";
import { mockProducts } from "../lambda-functions/mock-data";

jest.mock('../lambda-functions/mock-data', () => ({
  mockProducts: [
    {
      id: "1",
      title: "First item",
      description: "First item description",
      price: 9.99,
    },
    {
      id: "2",
      title: "Second item",
      description: "Second item description",
      price: 19.99,
    },
    {
      id: "3",
      title: "Third item",
      description: "Third item description",
      price: 29.99,
    },
  ],
}));


describe("getProductsList lambda function", (): void => {

  it("should return a list of products and status 200", async (): Promise<void> => {
    const event: APIGatewayProxyEvent = {} as APIGatewayProxyEvent;
    const context: Context = {} as Context;
    const result = (await handler(
      event,
      context,
      () => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(mockProducts));
  });

  it("should return status 404 if products are not found", async (): Promise<void> => {
    jest.mock('../lambda-functions/mock-data', () => ({
      mockProducts: [],
    }));
    const event: APIGatewayProxyEvent = {} as APIGatewayProxyEvent;
    const context: Context = {} as Context;
    const result = (await handler(
      event,
      context,
      (): void => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(404);
    expect(result.body).toBe(JSON.stringify({ message: "Product with requested id doesn't exist" }));
  });
});