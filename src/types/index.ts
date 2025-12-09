export type Currency = "KZT" | "USD" | "BTC" | "ETH" | "USDT";

export type FiatCurrency = "KZT" | "USD";
export type CryptoCurrency = "BTC" | "ETH" | "USDT";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  kycLevel: 0 | 1 | 2 | 3;
  isBlocked: boolean;
  twoFactorEnabled: boolean;
  referralCode: string;
  referredBy?: string;
}

export interface Wallet {
  id: string;
  userId: string;
  currency: Currency;
  balance: number;
  lockedBalance: number;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionType = "deposit" | "withdrawal" | "exchange" | "referral";
export type TransactionStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  fromCurrency?: Currency;
  toCurrency?: Currency;
  fromAmount?: number;
  toAmount?: number;
  fee?: number;
  rate?: number;
  txHash?: string;
  address?: string;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  fee: number;
  min: number;
  max: number;
  updatedAt: Date;
}

export interface KYCDocument {
  id: string;
  userId: string;
  type: "passport" | "id_card" | "driver_license" | "selfie" | "address_proof";
  status: "pending" | "approved" | "rejected";
  fileUrl: string;
  comment?: string;
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface Referral {
  id: string;
  referralId: string;
  email: string;
  registeredAt: Date;
  isActive: boolean;
  totalEarned: number;
  totalTransactions: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface LoginHistory {
  id: string;
  userId: string;
  ip: string;
  userAgent: string;
  location?: string;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  status: "new" | "open" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  attachments?: string[];
  isStaff: boolean;
  createdAt: Date;
}