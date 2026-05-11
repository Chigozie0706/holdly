"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface StacksContextType {
  address: string | null;
  btcAddress: string | null;
  publicKey: string | null;
  connected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isLoading: boolean;
}

const StacksContext = createContext<StacksContextType | undefined>(undefined);

export function StacksProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [btcAddress, setBtcAddress] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function connectWallet() {
    if (connected && address) return;

    setIsLoading(true);

    try {
      const { connect } = await import("@stacks/connect");
      const response = await connect();

      const stxAccount = response.addresses[2];
    } catch (error) {
    } finally {
    }
  }
}
