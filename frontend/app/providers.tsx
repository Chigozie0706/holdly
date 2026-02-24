"use client";

import { StacksProvider } from "@/providers/stacks-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <StacksProvider>{children}</StacksProvider>;
}
