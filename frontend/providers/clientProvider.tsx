"use client";

import { StacksProvider } from "@/providers/stacks-provider";

export function ClientProvider({ children }: { children: React.ReactNode }) {
  return <StacksProvider>{children}</StacksProvider>;
}
