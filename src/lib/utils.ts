import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
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

export function formatNumber(
  number: number,
  locale: string = "ru-RU",
  decimals: number = 2
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
}

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  const maskedLocal = localPart.slice(0, 2) + "***";
  return `${maskedLocal}@${domain}`;
}

export function maskWalletAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}