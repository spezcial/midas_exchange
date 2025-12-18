import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function format_currency(
  amount: number,
  currency: string,
  locale: string = "ru-RU"
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "KZT" || currency === "USD" ? 2 : 8,
    maximumFractionDigits: currency === "KZT" || currency === "USD" ? 2 : 8,
  });
  return formatter.format(amount);
}

export function format_number(
  number: number,
  locale: string = "ru-RU",
  decimals: number = 2
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
}

export function mask_email(email: string): string {
  const [local_part, domain] = email.split("@");
  const masked_local = local_part.slice(0, 2) + "***";
  return `${masked_local}@${domain}`;
}

export function mask_wallet_address(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function copy_to_clipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function get_initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}