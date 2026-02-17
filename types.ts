
export interface Product {
  id: string;
  farmerId: string;
  farmerName: string;
  name: string;
  description: string;
  price: number; 
  consumerPrice: number; 
  category: string;
  unit: string;
  media: string[]; 
  location: string;
  lat?: number;
  lng?: number;
  rating: number;
  stockStatus: 'In Stock' | 'Sold Out' | 'Limited';
  freshnessLevel: 'High' | 'Medium';
}

export interface Farmer {
  id: string;
  name: string;
  bio: string;
  location: string;
  lat?: number;
  lng?: number;
  joinedDate: string;
  rating: number;
  phone: string;
  verified: boolean;
  profileImage: string;
  whatsAppEnabled: boolean;
}

export interface User {
  id: string;
  name: string;
  role: 'farmer' | 'consumer';
}

export interface CartItem extends Product {
  quantity: number;
}

export type Category = 'Vegetables' | 'Fruits' | 'Rice' | 'Grains' | 'Dairy' | 'Spices' | 'Organic';

export const CATEGORIES: Category[] = ['Vegetables', 'Fruits', 'Rice', 'Grains', 'Dairy', 'Spices', 'Organic'];
