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
  role?: "admin" | "user";
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
  deposit_address?: string | null;
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

// OTC Types
export type OTCOrderStatus =
  | "awaiting_review"
  | "negotiating"
  | "awaiting_payment"
  | "payment_received"
  | "completed"
  | "cancelled"
  | "expired";

export type OTCMessageType = "text" | "offer";
export type OTCOfferStatus = "pending" | "accepted" | "rejected";

export interface OTCOrder {
  id: number;
  uid: string;
  user_id: number;
  operator_id: number | null;
  from_currency_id: number;
  to_currency_id: number;
  from_amount: number;
  proposed_rate: number;
  agreed_rate: number | null;
  agreed_from_amount: number | null;
  to_amount: number | null;
  status: OTCOrderStatus;
  comment: string | null;
  cancel_reason: string | null;
  cancelled_by: string | null;
  payment_deadline: string | null;
  created_at: string;
  updated_at: string;
  unread_count: number;
}

export interface OTCMessage {
  id: number;
  order_id: number;
  sender_id: number;
  sender_role: string;
  message_type: OTCMessageType;
  content: string | null;
  offer_rate: number | null;
  offer_from_amount: number | null;
  offer_to_amount: number | null;
  offer_status: OTCOfferStatus | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface OTCOrderDetail extends OTCOrder {
  from_currency: CurrencyInfo;
  to_currency: CurrencyInfo;
  messages: OTCMessage[];
}

export interface OTCConfigWithCurrencies {
  id: number;
  from_currency_id: number;
  to_currency_id: number;
  min_from_amount: number;
  payment_timeout_min: number;
  is_active: boolean;
  from_currency: CurrencyInfo;
  to_currency: CurrencyInfo;
  created_at: string;
  updated_at: string;
}

export interface OTCOrdersListResponse {
  orders: OTCOrder[];
  total: number;
}

export interface OTCAuditLog {
  id: number;
  order_id: number;
  actor_id: number;
  actor_role: string;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface OTCAnalyticsSummary {
  total_orders: number;
  completed: number;
  cancelled: number;
  expired: number;
  conversion_rate: number;
  total_volume: number;
  avg_spread_pct: number;
}

export interface OTCAnalyticsPeriod {
  period: string;
  total: number;
  completed: number;
  cancelled: number;
  expired: number;
  volume: number;
}

export interface OTCAnalytics {
  summary: OTCAnalyticsSummary;
  by_period: OTCAnalyticsPeriod[];
}

export interface AdminListOTCOrdersParams {
  status?: string;
  email?: string;
  from_date?: string;
  to_date?: string;
  from_currency_id?: number;
  to_currency_id?: number;
  operator_id?: number;
  limit?: number;
  offset?: number;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  kyc_level: 0 | 1 | 2 | 3;
}

export interface UserProfilePayload {
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone?: string;
  kyc_level: 0 | 1 | 2 | 3;
}

export type FeeOperation = "exchange" | "withdrawal";

export interface PlatformFee {
  id: number;
  user_id: number;
  operation: FeeOperation;
  currency_id: number;
  gross_amount: number;
  fee: number;
  created_at: string;
  user_email: string;
  currency_code: string;
  currency_symbol: string;
}

export interface PlatformFeesListResponse {
  fees: PlatformFee[];
  total: number;
  totals: {
    exchange: number;
    withdrawal: number;
  };
}
