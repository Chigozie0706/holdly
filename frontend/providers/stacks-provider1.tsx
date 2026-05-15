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
      const btcAccount = response.addresses[0];

      if (stxAccount) {
        setAddress(stxAccount.address);
        setPublicKey(stxAccount.publicKey);
        setConnected(true);
        console.log("Connected to:", stxAccount.address);
      }

      if (btcAccount) {
        setBtcAddress(btcAccount.address);
      }
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function disconnectWallet() {
    import("@stacks/connect").then(({ disconnect }) => disconnect());
    setAddress(null);
    setBtcAddress(null);
    setPublicKey(null);
    setConnected(false);
    console.log("Disconnected");
  }

  // Restore session on mount

  useEffect(() => {
    const checkConnection = async () => {
      const { isConnected, getLocalStorage } = await import("@stacks/connect");

      if (!isConnected()) return;

      try {
        const userData = getLocalStorage();

        if (!userData?.addresses) return;
        
        const addresses = Array.isArray(userData.addresses) ? userData.addresses : Object.values(userData.addresses);

        const stxAccount = addresses.find((acc: any) => acc.symbol === "STX")
        const btcAccount = addresses.find((acc: any) => acc.symbol === "BTC")

        if (stxAccount?.address) {
          setAddress(stxAccount.address)
          setPublicKey(stxAccount.publicKey)
          setBtcAddress()
        }
      }
    }
  });
}
