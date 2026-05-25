"use client";

import { useState, useEffect } from "react";
import Header from "@/components/HeaderWrapper";
import Footer from "@/components/Footer";
import { useStacks } from "@/providers/stacks-provider";
import { CONTRACT_ADDRESS, CONTRACT_NAME } from "@/config/contract";
import { BookOpen, Star } from "lucide-react";
import { toast } from "sonner";

interface HistoryEntry {
  bookId: number;
  title?: string;
  coverPage?: string;
  author?: string;
  borrowedAt: number;
  returnedAt: number;
  depositAmount: number;
  depositToken: string;
}

export default function BorrowHistoryPage() {
  const { address, connected } = useStacks();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [totalBorrows, setTotalBorrows] = useState(0);
  const [isFetching, setIsFetching] = useState(true);

  //  Rating state
  const [ratingBookId, setRatingBookId] = useState<number | null>(null);
  const [selectedScore, setSelectedScore] = useState(0);
  const [ratedBooks, setRatedBooks] = useState<Set<number>>(new Set());

  const fetchHistory = async () => {
    if (!connected || !address) {
      setIsFetching(false);
      return;
    }

    try {
      setIsFetching(true);
      const { fetchCallReadOnlyFunction, Cl, cvToJSON } =
        await import("@stacks/transactions");

      const { STACKS_MAINNET } = await import("@stacks/network");

      // Fetch total borrows
      const totalResult = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-user-total-borrows",
        functionArgs: [Cl.principal(address)],
        network: STACKS_MAINNET,
        senderAddress: CONTRACT_ADDRESS,
      });

      setTotalBorrows(Number(cvToJSON(totalResult).value.value));

      // Fetch history list
      const historyResult = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-user-borrow-history",
        functionArgs: [Cl.principal(address)],
        network: STACKS_MAINNET,
        senderAddress: CONTRACT_ADDRESS,
      });

      const historyJson = cvToJSON(historyResult);
      const entries = historyJson.value.value as any[];

      // Enrich with book details and check rating eligibility

      const enriched: HistoryEntry[] = await Promise.all(
        entries.map(async (entry: any) => {
          const bookId = Number(entry.value["book-id"].value)
          try {
            const bookResult = await fetchCallReadOnlyFunction({
              contractAddress: CONTRACT_ADDRESS,
              contractName: CONTRACT_NAME,
              functionName: "get-book",
              functionArgs: [Cl.uint(bookId)],
              network: STACKS_MAINNET,
              senderAddress: CONTRACT_ADDRESS,
            })

                        const bookJson = cvToJSON(bookResult);
            const bookData = bookJson.value?.value;

            const canRateResult = await fetchCallReadOnlyFunction({
              contractAddress: CONTRACT_ADDRESS,
              contractName: CONTRACT_NAME,
              functionName: "can-user-rate",
              functionArgs: [Cl.principal(address), Cl.uint(bookId)],
              network: STACKS_MAINNET,
              senderAddress: CONTRACT_ADDRESS,
            });

                        const canRateJson = cvToJSON(canRateResult);
            const alreadyRated = canRateJson.value.value["already-rated"].value;
            if (alreadyRated) {
                            setRatedBooks((prev) => new Set(prev).add(bookId));

            }
          }
        }),
      );
    } catch {}
  };
}
