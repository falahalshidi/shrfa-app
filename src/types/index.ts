export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

export interface Ticket {
  id: string;
  festivalId: string;
  festivalName: string;
  userId: string;
  purchaseDate: string;
  quantity: number;
  totalPrice: number;
  barcode: string;
  ticketNumber: string;
}

export interface Booking {
  id: string;
  festivalId: string;
  userId: string;
  quantity: number;
  totalPrice: number;
  purchaseDate: string;
  tickets: Ticket[];
}

