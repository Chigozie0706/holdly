"use client";

import { StacksProvider } from "@/providers/stacks-provider1";

export function Providers({ children }: { children: React.ReactNode }) {
  return <StacksProvider>{children}</StacksProvider>;
}
