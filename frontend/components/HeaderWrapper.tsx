"use client";

import Header from "@/components/Header";
import { useStacks } from "@/providers/stacks-provider";

// Thin client wrapper so layout.tsx can stay a Server Component.
// This is the only file that touches the wallet context.
export default function HeaderWrapper() {
  const { address, connected, connectWallet, disconnectWallet } = useStacks();

  return (
    <Header
      connected={connected}
      address={address}
      onConnect={connectWallet}
      onDisconnect={disconnectWallet}
    />
  );
}
