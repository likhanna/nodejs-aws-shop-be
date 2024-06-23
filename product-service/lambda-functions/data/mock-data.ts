export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Smart Electric Kettle',
    description:
      'The Smart Electric Kettle features precise temperature control and a rapid boil system, making it perfect for brewing tea and coffee. Its sleek design and durable stainless steel construction make it a stylish and practical addition to any kitchen.',
    price: 69.99,
  },
  {
    id: '2',
    title: 'Espresso Coffee Machine',
    description:
      "The Espresso Coffee Machine brews rich and aromatic espresso with ease. It features a built-in milk frother, programmable settings, and a sleek design, making it an essential addition to any coffee lover's kitchen.",
    price: 499.99,
  },
  {
    id: '3',
    title: 'Electric Grill',
    description:
      'The Electric Grill is perfect for indoor grilling, offering adjustable temperature controls and a non-stick surface. Its compact design and easy-to-clean drip tray make it ideal for cooking delicious grilled meals all year round.',
    price: 79.99,
  },
];

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
};

export type Stock = {
  product_id: Product['id'];
  count: number;
};

export type ProductStock = Product & Pick<Stock, 'count'>;

export type NewProduct = {
  title: Product['title'];
  description: Product['description'];
  price: Product['price'];
  count: Stock['count'];
};
