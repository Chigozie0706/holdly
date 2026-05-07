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
}
