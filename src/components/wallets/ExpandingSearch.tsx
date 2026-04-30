import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  value: string;
  on_change: (v: string) => void;
}

export function ExpandingSearch({ value, on_change }: Props) {
  const { t } = useTranslation();
  const [is_open, set_is_open] = useState(false);
  const [is_mobile, set_is_mobile] = useState(false);
  const input_ref = useRef<HTMLInputElement>(null);
  const blur_timer = useRef<number | null>(null);

  useEffect(() => {
    const update = () => set_is_mobile(window.matchMedia("(max-width: 767px)").matches);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const expanded = is_open || value.length > 0 || is_mobile;
  const target_width = expanded ? (is_mobile ? "100%" : 240) : 40;

  const open = (focus: boolean = false) => {
    if (blur_timer.current) {
      window.clearTimeout(blur_timer.current);
      blur_timer.current = null;
    }
    set_is_open(true);
    if (focus) {
      requestAnimationFrame(() => input_ref.current?.focus());
    }
  };

  const close_if_empty = () => {
    if (blur_timer.current) window.clearTimeout(blur_timer.current);
    blur_timer.current = window.setTimeout(() => {
      const focused = document.activeElement === input_ref.current;
      if (value === "" && !focused) set_is_open(false);
    }, 100);
  };

  const handle_key_down = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      on_change("");
      set_is_open(false);
      input_ref.current?.blur();
    }
  };

  return (
    <motion.div
      animate={{ width: target_width }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      onMouseEnter={() => !is_mobile && open(false)}
      onMouseLeave={() => !is_mobile && close_if_empty()}
      className="relative h-10 bg-white border border-gray-200 rounded-full shadow-sm overflow-hidden flex items-center"
      style={is_mobile ? { width: "100%" } : undefined}
    >
      <button
        type="button"
        onClick={() => open(true)}
        aria-label={t("common.search")}
        className="absolute left-0 top-0 h-10 w-10 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
        tabIndex={expanded ? -1 : 0}
      >
        <Search className="h-4 w-4" />
      </button>
      <motion.input
        ref={input_ref}
        type="text"
        value={value}
        onChange={(e) => on_change(e.target.value)}
        onFocus={() => open(false)}
        onBlur={close_if_empty}
        onKeyDown={handle_key_down}
        placeholder={t("wallets.searchPlaceholder")}
        animate={{ opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.15, delay: expanded ? 0.1 : 0 }}
        className="w-full h-10 pl-10 pr-9 text-sm bg-transparent outline-none placeholder:text-gray-400"
        aria-hidden={!expanded}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => {
            on_change("");
            input_ref.current?.focus();
          }}
          aria-label={t("common.close")}
          className="absolute right-0 top-0 h-10 w-9 flex items-center justify-center text-gray-400 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
}
