import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type AssetTypeFilterValue = "all" | "crypto" | "fiat";

interface Props {
  value: AssetTypeFilterValue;
  on_change: (v: AssetTypeFilterValue) => void;
  counts: { all: number; crypto: number; fiat: number };
}

export function AssetTypeFilter({ value, on_change, counts }: Props) {
  const { t } = useTranslation();

  const items: { key: AssetTypeFilterValue; label: string; count: number }[] = [
    { key: "all", label: t("wallets.filter.all"), count: counts.all },
    { key: "crypto", label: t("wallets.filter.crypto"), count: counts.crypto },
    { key: "fiat", label: t("wallets.filter.fiat"), count: counts.fiat },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1">
      {items.map((item) => {
        const active = value === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => on_change(item.key)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
              active
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <span>{item.label}</span>
            <span
              className={cn(
                "ml-1.5 text-xs",
                active ? "text-gray-500" : "text-gray-400"
              )}
            >
              {item.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
