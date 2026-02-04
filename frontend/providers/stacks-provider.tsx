// providers/stacks-provider.tsx
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

// Define the shape of our context
interface StacksContextType {
  addresses: any;
  connected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isLoading: boolean;
}

// Create the context with a default value
const StacksContext = createContext<StacksContextType | null>(null);

// Provider component
export function StacksProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function connectWallet() {
    try {
      const response = await connect();
      setAddresses(response.addresses);
      setConnected(true);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  }

  function disconnectWallet() {
    disconnect();
    setAddresses(null);
    setConnected(false);
  }

  // Check on mount if user is already connected
  useEffect(() => {
    const checkConnection = () => {
      if (isConnected()) {
        const userData = getLocalStorage();
        if (userData?.addresses) {
          setAddresses(userData.addresses);
          setConnected(true);
        }
      }
      setIsLoading(false);
    };

    checkConnection();
  }, []);

  return (
    <StacksContext.Provider
      value={{
        addresses,
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

// Custom hook to use the context
export function useStacks() {
  const context = useContext(StacksContext);

  if (!context) {
    throw new Error("useStacks must be used within StacksProvider");
  }

  return context;
}
