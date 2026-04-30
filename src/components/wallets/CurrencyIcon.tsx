import { CircleFlag } from "react-circle-flags";
import { cn } from "@/lib/utils";
import btc_icon from "cryptocurrency-icons/svg/color/btc.svg?url";
import eth_icon from "cryptocurrency-icons/svg/color/eth.svg?url";
import usdt_icon from "cryptocurrency-icons/svg/color/usdt.svg?url";
import sol_icon from "cryptocurrency-icons/svg/color/sol.svg?url";
import xrp_icon from "cryptocurrency-icons/svg/color/xrp.svg?url";
import ada_icon from "cryptocurrency-icons/svg/color/ada.svg?url";
import doge_icon from "cryptocurrency-icons/svg/color/doge.svg?url";
import bnb_icon from "cryptocurrency-icons/svg/color/bnb.svg?url";
import ltc_icon from "cryptocurrency-icons/svg/color/ltc.svg?url";
import trx_icon from "cryptocurrency-icons/svg/color/trx.svg?url";
import usdc_icon from "cryptocurrency-icons/svg/color/usdc.svg?url";
import dot_icon from "cryptocurrency-icons/svg/color/dot.svg?url";

const CRYPTO_ICONS: Record<string, string> = {
  BTC: btc_icon,
  ETH: eth_icon,
  USDT: usdt_icon,
  SOL: sol_icon,
  XRP: xrp_icon,
  ADA: ada_icon,
  DOGE: doge_icon,
  BNB: bnb_icon,
  LTC: ltc_icon,
  TRX: trx_icon,
  USDC: usdc_icon,
  DOT: dot_icon,
};

const FIAT_COUNTRY: Record<string, string> = {
  USD: "us",
  EUR: "european_union",
  KZT: "kz",
  RUB: "ru",
  GBP: "gb",
  CNY: "cn",
  JPY: "jp",
  TRY: "tr",
  CHF: "ch",
  AED: "ae",
};

interface Props {
  code: string;
  is_crypto?: boolean;
  size?: number;
  className?: string;
}

function lookup_crypto_icon(code: string): string | null {
  return CRYPTO_ICONS[code.toUpperCase()] ?? null;
}

export function CurrencyIcon({ code, is_crypto = true, size = 36, className }: Props) {
  const icon_url = is_crypto ? lookup_crypto_icon(code) : null;
  const country = !is_crypto ? FIAT_COUNTRY[code.toUpperCase()] : undefined;

  if (icon_url) {
    return (
      <img
        src={icon_url}
        alt={code}
        width={size}
        height={size}
        className={cn("rounded-full shrink-0", className)}
      />
    );
  }

  if (country) {
    return (
      <CircleFlag
        countryCode={country}
        height={size}
        width={size}
        className={cn("rounded-full shrink-0", className)}
        alt={code}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center shrink-0 font-semibold",
        is_crypto ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label={code}
    >
      {code.slice(0, 1)}
    </div>
  );
}
