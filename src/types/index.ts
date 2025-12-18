export type Currency = "KZT" | "USD" | "BTC" | "ETH" | "USDT";

export type FiatCurrency = "KZT" | "USD";
export type CryptoCurrency = "BTC" | "ETH" | "USDT";

export interface CurrencyInfo {
  id: number;
  code: string;
  name: string;
  is_crypto: boolean;
  is_active: boolean;
  symbol: string;
}

export interface CurrencyPair {
  id: number;
  from_currency_id: number;
  to_currency_id: number;
  rate: number;
  fee: number;
  from_currency: CurrencyInfo;
  to_currency: CurrencyInfo;
}

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
  kyc_level: 0 | 1 | 2 | 3;
  is_blocked: boolean;
  two_factor_enabled: boolean;
  referral_code: string;
  referred_by?: string;
}

export interface Wallet {
  balance: number;
  locked: number;
  created_at: string;
  currency: CurrencyInfo;
}

export type TransactionType = "deposit" | "withdrawal" | "exchange" | "referral";
export type TransactionStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

export interface Transaction {
  id: number;
  user_id: number;
  type: TransactionType;
  status: TransactionStatus;
  from_currency?: Currency;
  to_currency?: Currency;
  from_amount?: number;
  to_amount?: number;
  fee?: number;
  rate?: number;
  tx_hash?: string;
  address?: string;
  memo?: string;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  fee: number;
  min: number;
  max: number;
  updated_at: Date;
}

export interface KYCDocument {
  id: string;
  user_id: string;
  type: "passport" | "id_card" | "driver_license" | "selfie" | "address_proof";
  status: "pending" | "approved" | "rejected";
  file_url: string;
  comment?: string;
  created_at: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
}

export interface Referral {
  id: string;
  referral_id: string;
  email: string;
  registered_at: Date;
  is_active: boolean;
  total_earned: number;
  total_transactions: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  is_read: boolean;
  created_at: Date;
}

export interface LoginHistory {
  id: string;
  user_id: string;
  ip: string;
  user_agent: string;
  location?: string;
  created_at: Date;
}

export interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  status: "new" | "open" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  created_at: Date;
  updated_at: Date;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  attachments?: string[];
  is_staff: boolean;
  created_at: Date;
}

// Currency Exchange Types (New - Instant Swap Model)
export type CurrencyExchangeStatus = "pending" | "completed" | "canceled";

export interface CurrencyExchange {
  id: number;
  uid: string;
  from_currency_id: number;
  to_currency_id: number;
  from_currency: CurrencyInfo;
  to_currency: CurrencyInfo;
  from_amount: number;
  to_amount: number;
  to_amount_with_fee: number;  // Actual amount received after fee deduction
  exchange_rate: number;
  fee: number;
  status: CurrencyExchangeStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminCurrencyExchange extends CurrencyExchange {
  user_id: number;
  email: string;
}

export interface CreateExchangeRequest {
  from_currency_code: string;
  to_currency_code: string;
  from_amount: number;
}

export interface CreateExchangeResponse {
  id: number;
  uid: string;
  user_id: number;
  from_currency_id: number;
  to_currency_id: number;
  from_amount: number;
  to_amount: number;
  to_amount_with_fee: number;
  exchange_rate: number;
  fee: number;
  status: CurrencyExchangeStatus;
  created_at: string;
  updated_at: string;
}

export interface ExchangesListResponse {
  exchanges: CurrencyExchange[];
  total: number;
}

export interface AdminExchangesListResponse {
  exchanges: AdminCurrencyExchange[];
  total: number;
}