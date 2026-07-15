export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  unit: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
}

export interface MaterialOrder {
  id: string;
  items: CartItem[];
  deliveryAddress: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}
