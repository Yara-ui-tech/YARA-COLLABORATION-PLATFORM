export type ShopCategory = 
  | 'all' 
  | 'kits' 
  | 'microcontrollers' 
  | 'sensors' 
  | 'motors' 
  | 'components';

export interface ShopProduct {
  id: string;
  title: string;
  subtitle: string;
  category: ShopCategory;
  categoryLabel: string;
  priceUsd: number;
  description: string;
  imageUrl: string;
  includedComponents?: string[];
  specifications?: string[];
  inStock: boolean;
  badge?: string;
  suitableLevels?: string;
}

export interface ShopOrder {
  id: string;
  productId: string;
  productTitle: string;
  quantity: number;
  totalPriceUsd: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  cityOrProvince: string;
  schoolOrClubName?: string;
  paymentMethod: 'ecocash' | 'card' | 'innbucks' | 'cash_on_delivery' | 'bank_transfer' | 'whatsapp';
  orderDate: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
}

