
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { mockProducts } from "./mock-data";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
  ): Promise<APIGatewayProxyResult> => {
    const productId = event.pathParameters?.productId;
  
    if (!productId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "Product id is not provided" }),
      };
    }
  
    const product = mockProducts.find(({ id }) => id === productId);
  
    if (product) {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      };
    } else {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "Product not found" }),
      };
    };
  };