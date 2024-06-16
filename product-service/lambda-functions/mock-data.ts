export const mockProducts: Product[] = [
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
  ];

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
};
