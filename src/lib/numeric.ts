import type {
  Wallet,
  CurrencyPair,
  ExchangeRate,
  Transaction,
  OTCOrder,
  OTCOrderDetail,
  OTCMessage,
  OTCConfigWithCurrencies,
  OTCAnalytics,
  PlatformFee,
  PlatformFeesListResponse,
} from "@/types";

export function parseNum(val: string | number | null | undefined, fallback = 0): number {
  if (val == null) return fallback;
  if (typeof val === "number") return isNaN(val) ? fallback : val;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? fallback : parsed;
}

function parseNumNullable(val: string | number | null | undefined): number | null {
  if (val == null) return null;
  return parseNum(val);
}

export function normalizeWallet(w: Wallet): Wallet {
  return { ...w, balance: parseNum(w.balance), locked: parseNum(w.locked) };
}

export function normalizeCurrencyPair(p: CurrencyPair): CurrencyPair {
  return { ...p, rate: parseNum(p.rate), fee: parseNum(p.fee) };
}

export function normalizeExchangeRate(r: ExchangeRate): ExchangeRate {
  return {
    ...r,
    rate: parseNum(r.rate),
    fee: parseNum(r.fee),
    min: parseNum(r.min),
    max: parseNum(r.max),
  };
}

export function normalizeTransaction(t: Transaction): Transaction {
  return {
    ...t,
    amount: t.amount != null ? parseNum(t.amount) : undefined,
    from_amount: t.from_amount != null ? parseNum(t.from_amount) : undefined,
    to_amount: t.to_amount != null ? parseNum(t.to_amount) : undefined,
    fee: t.fee != null ? parseNum(t.fee) : undefined,
    rate: t.rate != null ? parseNum(t.rate) : undefined,
  };
}

export function normalizeCurrencyExchange<T extends {
  from_amount: number;
  to_amount: number;
  to_amount_with_fee: number;
  exchange_rate: number;
  fee: number;
}>(e: T): T {
  return {
    ...e,
    from_amount: parseNum(e.from_amount),
    to_amount: parseNum(e.to_amount),
    to_amount_with_fee: parseNum(e.to_amount_with_fee),
    exchange_rate: parseNum(e.exchange_rate),
    fee: parseNum(e.fee),
  } as T;
}

function applyOTCOrderNumerics<T extends OTCOrder>(o: T): T {
  return {
    ...o,
    from_amount: parseNum(o.from_amount),
    proposed_rate: parseNum(o.proposed_rate),
    agreed_rate: parseNumNullable(o.agreed_rate),
    agreed_from_amount: parseNumNullable(o.agreed_from_amount),
    to_amount: parseNumNullable(o.to_amount),
  } as T;
}

export function normalizeOTCOrder(o: OTCOrder): OTCOrder {
  return applyOTCOrderNumerics(o);
}

export function normalizeOTCMessage(m: OTCMessage): OTCMessage {
  return {
    ...m,
    offer_rate: parseNumNullable(m.offer_rate),
    offer_from_amount: parseNumNullable(m.offer_from_amount),
    offer_to_amount: parseNumNullable(m.offer_to_amount),
  };
}

export function normalizeOTCOrderDetail(o: OTCOrderDetail): OTCOrderDetail {
  return {
    ...applyOTCOrderNumerics(o),
    messages: o.messages.map(normalizeOTCMessage),
  };
}

export function normalizeOTCAnalytics(a: OTCAnalytics): OTCAnalytics {
  return {
    summary: {
      ...a.summary,
      total_orders: parseNum(a.summary.total_orders),
      completed: parseNum(a.summary.completed),
      cancelled: parseNum(a.summary.cancelled),
      expired: parseNum(a.summary.expired),
      conversion_rate: parseNum(a.summary.conversion_rate),
      total_volume: parseNum(a.summary.total_volume),
      avg_spread_pct: parseNum(a.summary.avg_spread_pct),
    },
    by_period: a.by_period.map((p) => ({
      ...p,
      total: parseNum(p.total),
      completed: parseNum(p.completed),
      cancelled: parseNum(p.cancelled),
      expired: parseNum(p.expired),
      volume: parseNum(p.volume),
    })),
  };
}

export function normalizeOTCConfig(c: OTCConfigWithCurrencies): OTCConfigWithCurrencies {
  return { ...c, min_from_amount: parseNum(c.min_from_amount) };
}

export function normalizePlatformFee(f: PlatformFee): PlatformFee {
  return { ...f, gross_amount: parseNum(f.gross_amount), fee: parseNum(f.fee) };
}

export function normalizePlatformFeesListResponse(r: PlatformFeesListResponse): PlatformFeesListResponse {
  return {
    ...r,
    fees: r.fees.map(normalizePlatformFee),
    totals: {
      exchange: parseNum(r.totals.exchange),
      withdrawal: parseNum(r.totals.withdrawal),
    },
  };
}
