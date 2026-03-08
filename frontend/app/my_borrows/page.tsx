"use client";

import React, { useState, useEffect } from "react";
import MyBorrows from "@/components/MyBorrows";
import { useStacks } from "@/providers/stacks-provider";

const CONTRACT_ADDRESS = "ST3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJAGZBY3K";
const CONTRACT_NAME = "holdlyv6";

interface Book {
  id: number;
  title: string;
  author: string;
  coverPage?: string;
  "is-available": boolean;
  "total-borrows": number;
  "deposit-amount": number;
  borrowedAt?: number;
}

export default function MyBorrowsPage() {
  const { address, connected } = useStacks();
  const [borrowedBooks, setBorrowedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchBorrowedBooks = async () => {
    if (!connected || !address) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    try {
      const { fetchCallReadOnlyFunction, Cl, cvToJSON } =
        await import("@stacks/transactions");
      const { STACKS_TESTNET } = await import("@stacks/network");

      // Get total book count first
      const countResult = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-book-count",
        functionArgs: [],
        network: STACKS_TESTNET,
        senderAddress: CONTRACT_ADDRESS,
      });
      const totalBooks = Number(cvToJSON(countResult).value.value);

      const userBorrowed: Book[] = [];
      for (let i = 1; i <= totalBooks; i++) {
        try {
          // Check if there's an active borrow for this book
          const borrowResult = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "get-borrow",
            functionArgs: [Cl.uint(i)],
            network: STACKS_TESTNET,
            senderAddress: CONTRACT_ADDRESS,
          });
          const borrowJson = cvToJSON(borrowResult);
          if (borrowJson.value) {
            const borrowData = borrowJson.value.value;
            if (borrowData.borrower.value === address) {
              // Fetch book details
              const bookResult = await fetchCallReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: "get-book",
                functionArgs: [Cl.uint(i)],
                network: STACKS_TESTNET,
                senderAddress: CONTRACT_ADDRESS,
              });
              const bookJson = cvToJSON(bookResult);
              if (bookJson.value) {
                const d = bookJson.value.value;
                userBorrowed.push({
                  id: i,
                  title: d.title.value,
                  author: d.author.value,
                  coverPage: d["cover-page"].value,
                  "is-available": false,
                  "total-borrows": Number(d["total-borrows"].value),
                  "deposit-amount": Number(borrowData["deposit-amount"].value),
                  borrowedAt: Number(borrowData["borrowed-at"].value),
                });
              }
            }
          }
        } catch (e) {
          /* no active borrow for this book */
        }
      }
      setBorrowedBooks(userBorrowed);
    } catch (e) {
      console.error("Error fetching borrowed books:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, [connected, address]);

  const handleReturn = async (bookId: number) => {
    if (!connected || !address) {
      alert("Please connect your wallet first");
      return;
    }
    const book = borrowedBooks.find((b) => b.id === bookId);
    if (!book) {
      alert("Book not found");
      return;
    }

    setIsProcessing(true);
    try {
      const { request } = await import("@stacks/connect");
      const { Cl } = await import("@stacks/transactions");
      const response = await request("stx_callContract", {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: "return-book",
        functionArgs: [Cl.uint(bookId)],
        postConditions: [],
        postConditionMode: "allow" as any,
      });
      if (response.txid) {
        alert(
          `Returned! TX: ${response.txid}\nDeposit of ${(book["deposit-amount"] / 1_000_000).toFixed(2)} STX will be refunded.`,
        );
        setTimeout(async () => {
          await fetchBorrowedBooks();
          setIsProcessing(false);
        }, 10000);
      }
    } catch (e) {
      alert(
        `Failed to return: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
      setIsProcessing(false);
    }
  };

  return (
    <>
      {isProcessing && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "0.7rem 1.25rem",
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.15)",
            borderRadius: "2px",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontSize: "0.8rem",
            color: "rgba(147,197,253,0.7)",
          }}
        >
          <span
            style={{
              width: "14px",
              height: "14px",
              border: "1.5px solid rgba(147,197,253,0.2)",
              borderTopColor: "rgba(147,197,253,0.7)",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.7s linear infinite",
            }}
          />
          Processing return transaction… please wait.
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      <MyBorrows
        borrowedBooks={borrowedBooks}
        onReturn={handleReturn}
        connected={connected}
        isLoading={isLoading}
      />
    </>
  );
}
