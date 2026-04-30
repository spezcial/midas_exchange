import type { Wallet, CurrencyPair } from "@/types";

export function format_balance(value: number, decimals: number = 8): string {
  if (!isFinite(value) || value === 0) return "0";
  return value.toFixed(decimals).replace(/\.?0+$/, "");
}

export function format_usdt(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, "");
}

export function get_usdt_equivalence(wallet: Wallet, rates: CurrencyPair[]): number | null {
  if (wallet.currency.code === "USDT") return wallet.balance;

  const direct = rates.find(
    (p) => p.from_currency.code === wallet.currency.code && p.to_currency.code === "USDT"
  );
  if (direct) return wallet.balance * direct.rate;

  const reverse = rates.find(
    (p) => p.from_currency.code === "USDT" && p.to_currency.code === wallet.currency.code
  );
  if (reverse && reverse.rate > 0) return wallet.balance / reverse.rate;

  return null;
}

export function mask_balance(formatted: string): string {
  return "•".repeat(Math.max(formatted.length, 6));
}
