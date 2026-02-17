
export interface Product {
  id: string;
  farmerId: string;
  farmerName: string;
  name: string;
  description: string;
  price: number; // Base price set by farmer
  consumerPrice: number; // price + 15%
  category: string;
  unit: string;
  media: string[]; // Support for multiple images/videos
  location: string;
  rating: number;
  stockStatus: 'In Stock' | 'Sold Out' | 'Limited';
}

export interface Farmer {
  id: string;
  name: string;
  bio: string;
  location: string;
  joinedDate: string;
  rating: number;
  phone: string;
  verified: boolean;
  profileImage: string;
}

export interface User {
  id: string;
  name: string;
  role: 'farmer' | 'consumer';
  location: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type Category = 'Vegetables' | 'Fruits' | 'Rice' | 'Grains' | 'Dairy' | 'Spices' | 'Organic';

export const CATEGORIES: Category[] = ['Vegetables', 'Fruits', 'Rice', 'Grains', 'Dairy', 'Spices', 'Organic'];
