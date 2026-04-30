import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CurrencyInfo } from "@/types";
import { CurrencyIcon } from "./CurrencyIcon";

interface Props {
  value: string;
  on_change: (code: string) => void;
  currencies: CurrencyInfo[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function CurrencySelect({
  value,
  on_change,
  currencies,
  disabled,
  placeholder,
  className,
}: Props) {
  const selected = currencies.find((c) => c.code === value);

  return (
    <Select value={value} onValueChange={on_change} disabled={disabled}>
      <SelectTrigger
        className={
          className ??
          "h-[66px] w-full sm:w-[140px] px-4 gap-2 rounded-lg border border-gray-300 bg-white shadow-sm text-base font-medium"
        }
      >
        <SelectValue placeholder={placeholder ?? "..."}>
          {selected && (
            <div className="flex items-center gap-2">
              <CurrencyIcon
                code={selected.code}
                is_crypto={selected.is_crypto}
                size={24}
              />
              <span className="font-semibold">{selected.code}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {currencies.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            <div className="flex items-center gap-3 pr-2">
              <CurrencyIcon code={c.code} is_crypto={c.is_crypto} size={24} />
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold leading-tight">{c.code}</span>
                <span className="text-xs text-gray-500 leading-tight">{c.name}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
