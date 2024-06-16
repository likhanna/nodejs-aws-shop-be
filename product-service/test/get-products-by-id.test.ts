import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { mockProducts } from "../lambda-functions/mock-data";
import { handler } from "../lambda-functions/getProductsById";

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

describe("getProductById lambda function", (): void => {
  
  it("should return product by id and status 200", async (): Promise<void> => {
    const event: APIGatewayProxyEvent = {
      httpMethod: 'GET',
      pathParameters: { productId: "1" },
    } as any;
    const context: Context = {} as Context;
    const result = (await handler(
      event,
      context,
      (): void => {},
    )) as APIGatewayProxyResult;

    const productById = mockProducts.find(({ id }) => id === "1");

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(productById));
  });

  it("should return status 404 if еру product is not found", async (): Promise<void> => {
    const event: APIGatewayProxyEvent = {
      httpMethod: 'GET',
      pathParameters: { productId: "5" },
    } as any;
    const context: Context = {} as Context;
    const result = (await handler(
      event,
      context,
      (): void => {},
    )) as APIGatewayProxyResult;
 
    expect(result.statusCode).toBe(404);
    expect(result.body).toBe(JSON.stringify({ message: "Product with requested id doesn't exist" }));
  });

  it("should return status 400 if product ID is not provided", async (): Promise<void> => {
    const event: APIGatewayProxyEvent = {} as APIGatewayProxyEvent;
    const context: Context = {} as Context;
    const result = (await handler(
      event,
      context,
      (): void => {},
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    expect(result.body).toBe(
      JSON.stringify({ message: "Product id is not provided" }),
    );
  });
});