import { BaseEmailData } from './email.types';

// ============= MARKETPLACE ORDER EMAIL DATA =============

export interface MarketplaceOrderReceiptData extends BaseEmailData {
  orderId: string;
  orderDate: string;
  buyerName: string;
  sellerName: string;
  
  // Order items
  items: {
    title: string;
    quantity: number;
    price: number;
    currency: string;
    subtotal: number;
    imageUrl?: string;
  }[];
  
  // Pricing
  subtotal: number;
  platformFee: number;
  totalAmount: number;
  currency: string;
  
  // Shipping
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  
  // Payment
  paymentMethod: string;
  transactionId: string;
  paidAt: string;
  
  // Tracking
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface MarketplaceOrderConfirmationData extends BaseEmailData {
  orderId: string;
  buyerName: string;
  sellerName: string;
  itemTitle: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  orderUrl: string;
}

export interface MarketplaceShippingNotificationData extends BaseEmailData {
  orderId: string;
  buyerName: string;
  itemTitle: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  trackingUrl: string;
}

// ============= EVENT TICKET EMAIL DATA =============

export interface EventTicketReceiptData extends BaseEmailData {
  ticketId: string;
  eventId: string;
  purchaseDate: string;
  attendeeName: string;
  
  // Event details
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventMapLink?: string;
  eventImage?: string;
  
  // Ticket details
  ticketTier?: string;
  quantity: number;
  price: number;
  platformFee: number;
  totalAmount: number;
  currency: string;
  
  // Payment
  paymentMethod: string;
  transactionId: string;
  paidAt: string;
  
  // QR Code
  qrCodeUrl: string;
  checkInCode: string;
  
  // Host info
  hostName: string;
  hostContact?: string;
}

export interface EventTicketConfirmationData extends BaseEmailData {
  ticketId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  attendeeName: string;
  quantity: number;
  qrCodeUrl: string;
  eventUrl: string;
}

export interface EventReminderWithTicketData extends BaseEmailData {
  ticketId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  attendeeName: string;
  qrCodeUrl: string;
  mapLink?: string;
  hoursUntilEvent: number;
}

// ============= PAYMENT REFUND EMAIL DATA =============

export interface RefundConfirmationData extends BaseEmailData {
  refundId: string;
  orderId?: string;
  ticketId?: string;
  refundDate: string;
  customerName: string;
  
  refundAmount: number;
  currency: string;
  refundReason: string;
  
  originalTransactionId: string;
  refundTransactionId: string;
  
  estimatedProcessingDays: number;
  refundMethod: string;
}

// ============= SELLER/HOST PAYOUT EMAIL DATA =============

export interface PayoutNotificationData extends BaseEmailData {
  payoutId: string;
  recipientName: string;
  
  amount: number;
  currency: string;
  
  itemType: 'event' | 'marketplace_order';
  itemTitle: string;
  itemId: string;
  
  payoutDate: string;
  payoutMethod: string;
  estimatedArrival: string;
  
  transactionId: string;
}
