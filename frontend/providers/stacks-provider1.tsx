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
      const { connect, getLocalStorage } = await import("@stacks/connect");
      await connect();

      // ✅ Poll localStorage up to 10 times (every 300ms)
      // because the wallet writes addresses after the promise resolves
      let attempts = 0;
      const poll = setInterval(() => {
        attempts++;
        const userData = getLocalStorage() as any;
        const stxAddress = userData?.addresses?.stx?.[0]?.address ?? null;
        const stxPublicKey = userData?.addresses?.stx?.[0]?.publicKey ?? null;
        const btcAddr = userData?.addresses?.btc?.[0]?.address ?? null;

        if (stxAddress) {
          setAddress(stxAddress);
          setPublicKey(stxPublicKey);
          setBtcAddress(btcAddr);
          setConnected(true);
          console.log("✅ Connected:", stxAddress);
          clearInterval(poll);
          setIsLoading(false);
        } else if (attempts >= 10) {
          clearInterval(poll);
          setIsLoading(false);
          console.warn("⚠️ Could not read address after connect");
        }
      }, 300);
    } catch (error) {
      console.error("❌ Connection failed:", error);
      setIsLoading(false);
    }
  }

  function disconnectWallet() {
    import("@stacks/connect").then(({ disconnect }) => disconnect());
    setAddress(null);
    setBtcAddress(null);
    setPublicKey(null);
    setConnected(false);
  }

  useEffect(() => {
    const checkConnection = async () => {
      const { isConnected, getLocalStorage } = await import("@stacks/connect");

      if (!isConnected()) return;

      try {
        // ✅ Cast to any to bypass stale AddressEntry[] type
        const userData = getLocalStorage() as any;
        console.log("📦 localStorage data:", userData);

        if (!userData?.addresses) return;

        const stxAddress = userData.addresses?.stx?.[0]?.address ?? null;
        const stxPublicKey = userData.addresses?.stx?.[0]?.publicKey ?? null;
        const btcAddr = userData.addresses?.btc?.[0]?.address ?? null;

        if (stxAddress) {
          setAddress(stxAddress);
          setPublicKey(stxPublicKey);
          setBtcAddress(btcAddr);
          setConnected(true);
          console.log("🔄 Restored session:", stxAddress);
        }
      } catch (error) {
        console.error("❌ Error restoring session:", error);
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
