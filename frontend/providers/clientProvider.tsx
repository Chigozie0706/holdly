"use client";

import { StacksProvider } from "@/providers/stacks-provider1";

export function ClientProvider({ children }: { children: React.ReactNode }) {
  return <StacksProvider>{children}</StacksProvider>;
}
