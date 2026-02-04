// components/navbar.tsx
"use client";

import { useStacks } from "@/providers/stacks-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const router = useRouter();
  const [searchAddress, setSearchAddress] = useState("");

  // Get wallet data from provider - NO props needed!
  const { addresses, connected, connectWallet, disconnectWallet, isLoading } =
    useStacks();

  function handleSearch() {
    if (!searchAddress.startsWith("SP")) {
      return alert("Please enter a mainnet Stacks address");
    }
    router.push(`/${searchAddress}`);
  }

  if (isLoading) {
    return (
      <nav className="flex w-full items-center justify-between gap-4 p-4 h-16 border-b border-gray-500">
        Loading...
      </nav>
    );
  }

  return (
    <nav className="flex w-full items-center justify-between gap-4 p-4 h-16 border-b border-gray-500">
      <Link href="/" className="text-2xl font-bold">
        Stacks Account History
      </Link>

      <input
        type="text"
        placeholder="SP..."
        className="w-96 rounded-lg bg-gray-700 px-4 py-2 text-sm"
        onChange={(e) => setSearchAddress(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />

      <div className="flex items-center gap-2">
        {connected ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/${addresses.stx[0].address}`)}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              View {addresses.stx[0].address.slice(0, 5)}...
              {addresses.stx[0].address.slice(-4)}
            </button>
            <button
              type="button"
              onClick={disconnectWallet}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={connectWallet}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
