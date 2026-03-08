"use client";

import React, { useState, useEffect } from "react";
import BrowseBooks from "@/components/BrowseBooks";
import { useStacks } from "@/providers/stacks-provider";

const DEPOSIT_AMOUNT = 1000000;
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
}

export default function Library() {
  const { address, connected } = useStacks();
  const [books, setBooks] = useState<Book[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAllBooks = async () => {
    try {
      setIsFetching(true);
      const { fetchCallReadOnlyFunction, Cl, cvToJSON } =
        await import("@stacks/transactions");
      const { STACKS_TESTNET } = await import("@stacks/network");

      const countResult = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-book-count",
        functionArgs: [],
        network: STACKS_TESTNET,
        senderAddress: CONTRACT_ADDRESS,
      });

      const totalBooks = Number(cvToJSON(countResult).value.value);
      const fetched: Book[] = [];

      for (let i = 1; i <= totalBooks; i++) {
        try {
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
            fetched.push({
              id: i,
              title: d.title.value,
              author: d.author.value,
              coverPage: d["cover-page"].value,
              "is-available": d["is-available"].value,
              "total-borrows": Number(d["total-borrows"].value),
              "deposit-amount": Number(d["deposit-amount"].value),
            });
          }
        } catch (e) {
          console.error(`Error fetching book ${i}:`, e);
        }
      }
      setBooks(fetched);

      console.log("fetched", fetched);
    } catch (e) {
      console.error("Error fetching books:", e);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchAllBooks();
  }, []);

  const handleBorrow = async (bookId: number) => {
    if (!connected || !address) {
      alert("Please connect your wallet first");
      return;
    }
    const book = books.find((b) => b.id === bookId);
    if (!book || !book["is-available"]) {
      alert("Book is not available");
      return;
    }
    if (
      !window.confirm(
        `Borrow "${book.title}"?\n\nDeposit: ${(book["deposit-amount"] / 1_000_000).toFixed(2)} STX (refunded on return)`,
      )
    )
      return;

    setIsProcessing(true);
    try {
      const { request } = await import("@stacks/connect");
      const { Cl } = await import("@stacks/transactions");
      const response = await request("stx_callContract", {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: "borrow-book",
        functionArgs: [Cl.uint(bookId)],
        postConditions: [],
        postConditionMode: "allow" as any,
      });
      if (response.txid) {
        alert(
          `Borrow submitted! TX: ${response.txid}\n\nWaiting for confirmation…`,
        );
        setTimeout(async () => {
          await fetchAllBooks();
          setIsProcessing(false);
        }, 10000);
      }
    } catch (e) {
      alert(
        `Failed to borrow: ${e instanceof Error ? e.message : "Unknown error"}`,
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
          Processing transaction… please wait.
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      <BrowseBooks
        books={books}
        depositAmount={DEPOSIT_AMOUNT}
        onBorrow={handleBorrow}
        connected={connected}
        isLoading={isFetching}
      />
    </>
  );
}
