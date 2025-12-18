import { create } from "zustand";
import type { Wallet, Currency } from "@/types";
import { walletService } from "@/api/services/walletService";
import toast from "react-hot-toast";

interface WalletState {
  wallets: Wallet[];
  selected_wallet: Wallet | null;
  is_balance_hidden: boolean;
  is_loading: boolean;
  error: string | null;
  set_wallets: (wallets: Wallet[]) => void;
  update_wallet: (currency: Currency, updates: Partial<Wallet>) => void;
  select_wallet: (wallet: Wallet | null) => void;
  toggle_balance_visibility: () => void;
  set_loading: (loading: boolean) => void;
  get_total_balance: (currency?: Currency) => number;
  load_wallets: () => Promise<void>;
  deposit: (currency: Currency, amount: number) => Promise<boolean>;
  withdraw: (currency: Currency, amount: number, address: string) => Promise<boolean>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  selected_wallet: null,
  is_balance_hidden: false,
  is_loading: false,
  error: null,

  set_wallets: (wallets) => set({ wallets }),

  update_wallet: (currency, updates) =>
    set((state) => ({
      wallets: state.wallets.map((wallet) =>
        wallet.currency.code === currency ? { ...wallet, ...updates } : wallet
      ),
    })),

  select_wallet: (wallet) => set({ selected_wallet: wallet }),

  toggle_balance_visibility: () => set((state) => ({ is_balance_hidden: !state.is_balance_hidden })),

  set_loading: (loading) => set({ is_loading: loading }),

  get_total_balance: (currency) => {
    const wallets = get().wallets;
    if (!wallets.length) return 0;

    if (currency) {
      const wallet = wallets.find((w) => w.currency.code === currency);
      return wallet ? wallet.balance : 0;
    }

    // Calculate total in USD equivalent
    // This is simplified - in real app would use actual exchange rates
    const rates: Record<string, number> = {
      USD: 1,
      KZT: 0.0022,
      BTC: 45000,
      ETH: 2500,
      USDT: 1,
    };

    return wallets.reduce((total, wallet) => {
      const rate = rates[wallet.currency.code] || 1;
      return total + wallet.balance * rate;
    }, 0);
  },

  load_wallets: async () => {
    try {
      set({ is_loading: true, error: null });
      const wallets = await walletService.get_wallets();
      set({ wallets, is_loading: false });
    } catch (error: any) {
      const error_message = error.response?.data?.error || "Failed to load wallets";
      set({ is_loading: false, error: error_message });
      toast.error(error_message);
    }
  },

  deposit: async (currency: Currency, amount: number): Promise<boolean> => {
    try {
      set({ is_loading: true, error: null });
      const result = await walletService.deposit({ currency, amount });
      set({ wallets: result.wallets, is_loading: false });
      toast.success(`Successfully deposited ${amount} ${currency}`);
      return true;
    } catch (error: any) {
      const error_message = error.response?.data?.error || "Failed to deposit funds";
      set({ is_loading: false, error: error_message });
      toast.error(error_message);
      return false;
    }
  },

  withdraw: async (currency: Currency, amount: number, address: string): Promise<boolean> => {
    try {
      set({ is_loading: true, error: null });
      const result = await walletService.withdraw({ currency, amount, address });
      set({ wallets: result.wallets, is_loading: false });
      toast.success(`Withdrawal of ${amount} ${currency} initiated`);
      return true;
    } catch (error: any) {
      const error_message = error.response?.data?.error || "Failed to withdraw funds";
      set({ is_loading: false, error: error_message });
      toast.error(error_message);
      return false;
    }
  },
}));