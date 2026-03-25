"use client";

import React, { useState, useEffect } from "react";
import BrowseBooks from "@/components/BrowseBooks";
import { useStacks } from "@/providers/stacks-provider";
import { toast } from "sonner";

const DEPOSIT_AMOUNT = 1000000;
const CONTRACT_ADDRESS = "SP3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJB3SS99R";
const CONTRACT_NAME = "holdlyv8";

interface Book {
  id: number;
  title: string;
  author: string;
  coverPage?: string;
  owner?: string;
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
      const { STACKS_MAINNET } = await import("@stacks/network");

      const countResult = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-book-count",
        functionArgs: [],
        network: STACKS_MAINNET,
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
            network: STACKS_MAINNET,
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
              owner: d.owner.value,
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
      toast.error("Please connect your wallet first");
      return;
    }
    const book = books.find((b) => b.id === bookId);
    if (!book || !book["is-available"]) {
      toast.error("Book is not available");
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
      const { Cl, Pc } = await import("@stacks/transactions");

      const response = await request("stx_callContract", {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: "borrow-book",
        functionArgs: [Cl.uint(bookId)],
        postConditions: [
          // Borrower sends deposit to the contract
          Pc.principal(address).willSendEq(book["deposit-amount"]).ustx(),
        ],
      });

      if (response.txid) {
        toast.error(
          `Borrow submitted! TX: ${response.txid}\n\nWaiting for confirmation…`,
        );
        setTimeout(async () => {
          await fetchAllBooks();
          setIsProcessing(false);
        }, 10000);
      }
    } catch (e) {
      console.error("Borrow error:", e);
      alert(
        `Failed to borrow: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
      setIsProcessing(false);
    }
  };

  const handleUpdateBook = async (
    bookId: number,
    title: string,
    author: string,
    coverPage: string,
  ) => {
    if (!connected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsProcessing(true);
    try {
      const { request } = await import("@stacks/connect");
      const { Cl } = await import("@stacks/transactions");

      const response = await request("stx_callContract", {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: "update-book",
        functionArgs: [
          Cl.uint(bookId),
          Cl.stringUtf8(title),
          Cl.stringUtf8(author),
          Cl.stringUtf8(coverPage || "https://via.placeholder.com/150"),
          Cl.uint(DEPOSIT_AMOUNT),
        ],
      });

      if (response.txid) {
        toast.success(`Book updated! TX: ${response.txid}`);
        // Optimistically update local state
        setBooks((prev) =>
          prev.map((b) =>
            b.id === bookId ? { ...b, title, author, coverPage } : b,
          ),
        );
      }
    } catch (error) {
      toast.error(
        `Failed to update: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!connected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    if (
      !window.confirm(
        `Are you sure you want to delete "${book.title}"? This cannot be undone.`,
      )
    )
      return;

    setIsProcessing(true);
    try {
      const { request } = await import("@stacks/connect");
      const { Cl } = await import("@stacks/transactions");

      const response = await request("stx_callContract", {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: "delete-book",
        functionArgs: [Cl.uint(bookId)],
      });

      if (response.txid) {
        toast.success(`Book deleted! TX: ${response.txid}`);
        // Optimistically remove from local state
        setBooks((prev) => prev.filter((b) => b.id !== bookId));
      }
    } catch (error) {
      toast.error(
        `Failed to delete: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
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
        onUpdate={handleUpdateBook}
        onDelete={handleDeleteBook}
        address={address}
      />
    </>
  );
}
