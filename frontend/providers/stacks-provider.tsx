"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  connect,
  disconnect,
  isConnected,
  getLocalStorage,
} from "@stacks/connect";

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
    // Don't re-connect if already connected
    if (connected && address) {
      console.log("Already connected to:", address);
      return;
    }

    setIsLoading(true);
    try {
      const response = await connect();

      console.log("Full connect response:", response);

      // addresses[2] = STX, addresses[0] = BTC
      const stxAccount = response.addresses[2];
      const btcAccount = response.addresses[0];

      if (stxAccount) {
        setAddress(stxAccount.address);
        setPublicKey(stxAccount.publicKey);
        setConnected(true);
        console.log("✅ Connected to:", stxAccount.address);
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
    disconnect();
    setAddress(null);
    setBtcAddress(null);
    setPublicKey(null);
    setConnected(false);
    console.log("🔌 Disconnected");
  }

  function loadUserData() {
    try {
      const userData = getLocalStorage();

      console.log("📦 Raw localStorage data:", userData);

      // Check various possible structures
      if (!userData) {
        console.log("No persisted data found");
        return;
      }

      let stxAccount = null;
      let btcAccount = null;

      // Try different data structures
      if (userData.addresses && Array.isArray(userData.addresses)) {
        console.log("Found addresses array");
        stxAccount = userData.addresses.find(
          (acc: any) => acc.symbol === "STX",
        );
        btcAccount = userData.addresses.find(
          (acc: any) => acc.symbol === "BTC",
        );
      } else if (userData.addresses) {
        // Maybe it's an object structure
        console.log("Addresses is not an array:", userData.addresses);
      }

      if (stxAccount && stxAccount.address) {
        setAddress(stxAccount.address);
        setPublicKey(stxAccount.publicKey);
        setBtcAddress(btcAccount?.address || null);
        setConnected(true);
        console.log("🔄 Restored connection to:", stxAccount.address);
      } else {
        console.log("⚠️ No STX account found in persisted data");
        // Force reconnect
        connectWallet();
      }
    } catch (error) {
      console.error("❌ Error loading persisted data:", error);
      // If loading fails, try fresh connection
      connectWallet();
    }
  }

  // Check for existing connection on mount
  useEffect(() => {
    console.log("🚀 StacksProvider mounted");

    const checkConnection = async () => {
      if (isConnected()) {
        console.log("📍 isConnected() returned true");
        loadUserData();
      } else {
        console.log(
          "📍 isConnected() returned false - no persisted connection",
        );
      }
    };

    checkConnection();
  }, []);

  const value = {
    address,
    btcAddress,
    publicKey,
    connected,
    connectWallet,
    disconnectWallet,
    isLoading,
  };

  return (
    <StacksContext.Provider value={value}>{children}</StacksContext.Provider>
  );
}

export function useStacks() {
  const context = useContext(StacksContext);

  if (context === undefined) {
    throw new Error(
      "useStacks must be used within a StacksProvider. " +
        "Make sure your component is wrapped with <StacksProvider>.",
    );
  }

  return context;
}
