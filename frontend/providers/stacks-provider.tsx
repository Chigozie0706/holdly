"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ❌ Remove top-level imports from @stacks/connect
// import { connect, disconnect, isConnected, getLocalStorage } from "@stacks/connect";

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
      // ✅ Dynamically import only when called (guaranteed client-side)
      const { connect } = await import("@stacks/connect");
      const response = await connect();

      const stxAccount = response.addresses[2];
      const btcAccount = response.addresses[0];

      if (stxAccount) {
        setAddress(stxAccount.address);
        setPublicKey(stxAccount.publicKey);
        setConnected(true);
      }
      if (btcAccount) {
        setBtcAddress(btcAccount.address);
      }
    } catch (error) {
      console.error("❌ Connection failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function disconnectWallet() {
    // ✅ Dynamic import here too
    import("@stacks/connect").then(({ disconnect }) => disconnect());
    setAddress(null);
    setBtcAddress(null);
    setPublicKey(null);
    setConnected(false);
  }

  useEffect(() => {
    const checkConnection = async () => {
      // ✅ Safe — only runs in browser, after mount
      const { isConnected, getLocalStorage } = await import("@stacks/connect");

      if (!isConnected()) return;

      try {
        const userData = getLocalStorage();
        if (!userData?.addresses) return;

        const stxAccount = Array.isArray(userData.addresses)
          ? userData.addresses.find((acc: any) => acc.symbol === "STX")
          : null;
        const btcAccount = Array.isArray(userData.addresses)
          ? userData.addresses.find((acc: any) => acc.symbol === "BTC")
          : null;

        if (stxAccount?.address) {
          setAddress(stxAccount.address);
          setPublicKey(stxAccount.publicKey);
          setBtcAddress(btcAccount?.address || null);
          setConnected(true);
        }
        // ❌ Removed auto-reconnect on failure — don't pop wallet on page load
      } catch (error) {
        console.error("❌ Error loading persisted data:", error);
      }
    };

    checkConnection();
  }, []);

  return (
    <StacksContext.Provider
      value={{
        address,
        btcAddress,
        publicKey,
        connected,
        connectWallet,
        disconnectWallet,
        isLoading,
      }}
    >
      {children}
    </StacksContext.Provider>
  );
}

export function useStacks() {
  const context = useContext(StacksContext);
  if (context === undefined) {
    throw new Error("useStacks must be used within a StacksProvider.");
  }
  return context;
}
