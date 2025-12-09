import { create } from "zustand";
import type { Wallet, Currency } from "@/types";

interface WalletState {
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  isBalanceHidden: boolean;
  isLoading: boolean;
  setWallets: (wallets: Wallet[]) => void;
  updateWallet: (currency: Currency, updates: Partial<Wallet>) => void;
  selectWallet: (wallet: Wallet | null) => void;
  toggleBalanceVisibility: () => void;
  setLoading: (loading: boolean) => void;
  getTotalBalance: (currency?: Currency) => number;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  selectedWallet: null,
  isBalanceHidden: false,
  isLoading: false,
  setWallets: (wallets) => set({ wallets }),
  updateWallet: (currency, updates) =>
    set((state) => ({
      wallets: state.wallets.map((wallet) =>
        wallet.currency === currency ? { ...wallet, ...updates } : wallet
      ),
    })),
  selectWallet: (wallet) => set({ selectedWallet: wallet }),
  toggleBalanceVisibility: () => set((state) => ({ isBalanceHidden: !state.isBalanceHidden })),
  setLoading: (loading) => set({ isLoading: loading }),
  getTotalBalance: (currency) => {
    const wallets = get().wallets;
    if (!wallets.length) return 0;
    
    if (currency) {
      const wallet = wallets.find((w) => w.currency === currency);
      return wallet ? wallet.balance : 0;
    }
    
    // Calculate total in USD equivalent
    // This is simplified - in real app would use actual exchange rates
    const rates: Record<Currency, number> = {
      USD: 1,
      KZT: 0.0022,
      BTC: 45000,
      ETH: 2500,
      USDT: 1,
    };
    
    return wallets.reduce((total, wallet) => {
      return total + wallet.balance * rates[wallet.currency];
    }, 0);
  },
}));