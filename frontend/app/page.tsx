"use client";

import React, { useState, useEffect } from "react";
import TabNavigation from "@/components/TabNavigation";
import BrowseBooks from "@/components/BrowseBooks";
import AddBookForm from "@/components/AddBookForm";
import MyBorrows from "@/components/MyBorrows";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useStacks } from "@/providers/stacks-provider";

// ❌ Remove these top-level imports
// import { request } from "@stacks/connect";
// import { Cl, cvToJSON, ... } from "@stacks/transactions";
// import { fetchCallReadOnlyFunction } from "@stacks/transactions";
// import { STACKS_TESTNET } from "@stacks/network";

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

export default function Home() {
  const { address, connected, connectWallet, disconnectWallet, isLoading } =
    useStacks();
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState("browse");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetchingBooks, setIsFetchingBooks] = useState(true);
  const [userBorrowedBooks, setUserBorrowedBooks] = useState<Book[]>([]);

  const fetchAllBooks = async () => {
    try {
      setIsFetchingBooks(true);

      // ✅ Dynamic import inside async function
      const { fetchCallReadOnlyFunction, Cl, cvToJSON } =
        await import("@stacks/transactions");
      const { STACKS_TESTNET } = await import("@stacks/network");

      const bookCountResult = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-book-count",
        functionArgs: [],
        network: STACKS_TESTNET,
        senderAddress: CONTRACT_ADDRESS,
      });

      const bookCountJson = cvToJSON(bookCountResult);
      const totalBooks = Number(bookCountJson.value.value);

      const fetchedBooks: Book[] = [];
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
            const bookData = bookJson.value.value;
            fetchedBooks.push({
              id: i,
              title: bookData.title.value,
              author: bookData.author.value,
              coverPage: bookData["cover-page"].value,
              "is-available": bookData["is-available"].value,
              "total-borrows": Number(bookData["total-borrows"].value),
              "deposit-amount": Number(bookData["deposit-amount"].value),
            });
          }
        } catch (error) {
          console.error(`Error fetching book ${i}:`, error);
        }
      }

      setBooks(fetchedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
      setBooks([]);
    } finally {
      setIsFetchingBooks(false);
    }
  };

  const fetchUserBorrowedBooks = async () => {
    if (!connected || !address) return [];

    try {
      const { fetchCallReadOnlyFunction, Cl, cvToJSON } =
        await import("@stacks/transactions");
      const { STACKS_TESTNET } = await import("@stacks/network");

      const userBorrowed: Book[] = [];
      for (const book of books) {
        if (!book["is-available"]) {
          try {
            const borrowResult = await fetchCallReadOnlyFunction({
              contractAddress: CONTRACT_ADDRESS,
              contractName: CONTRACT_NAME,
              functionName: "get-borrow",
              functionArgs: [Cl.uint(book.id)],
              network: STACKS_TESTNET,
              senderAddress: CONTRACT_ADDRESS,
            });

            const borrowJson = cvToJSON(borrowResult);
            if (borrowJson.value) {
              const borrowData = borrowJson.value.value;
              if (borrowData.borrower.value === address) {
                userBorrowed.push({
                  ...book,
                  borrowedAt: Number(borrowData["borrowed-at"].value),
                  depositAmount: Number(borrowData["deposit-amount"].value),
                } as any);
              }
            }
          } catch (error) {
            console.error(
              `Error fetching borrow info for book ${book.id}:`,
              error,
            );
          }
        }
      }
      return userBorrowed;
    } catch (error) {
      console.error("Error fetching user borrowed books:", error);
      return [];
    }
  };

  const handleAddBook = async (
    title: string,
    author: string,
    coverPage: string,
  ) => {
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }

    setIsProcessing(true);
    try {
      const { request } = await import("@stacks/connect");
      const { Cl } = await import("@stacks/transactions");

      const response = await request("stx_callContract", {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: "add-book",
        functionArgs: [
          Cl.stringUtf8(title),
          Cl.stringUtf8(author),
          Cl.stringUtf8(coverPage || "https://via.placeholder.com/150"),
          Cl.uint(DEPOSIT_AMOUNT),
        ],
      });

      if (response.txid) {
        setBooks([
          ...books,
          {
            id: books.length + 1,
            title,
            author,
            coverPage,
            "is-available": true,
            "total-borrows": 0,
            "deposit-amount": DEPOSIT_AMOUNT,
          },
        ]);
        setActiveTab("browse");
        alert(`Book added successfully! TX ID: ${response.txid}`);
      }
    } catch (error) {
      alert(
        `Failed to add book: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBorrowBook = async (bookId: number) => {
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
        `Borrow "${book.title}" by ${book.author}?\n\nDeposit: ${(book["deposit-amount"] / 1000000).toFixed(2)} STX (refunded on return)`,
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
          `Borrow submitted! TX: ${response.txid}\n\nWaiting for confirmation...`,
        );
        setTimeout(async () => {
          await fetchAllBooks();
          setIsProcessing(false);
          alert("Confirmed! Check 'My Borrows' tab.");
        }, 10000);
      }
    } catch (error) {
      alert(
        `Failed to borrow: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setIsProcessing(false);
    }
  };

  const handleReturnBook = async (bookId: number) => {
    if (!connected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    const book = userBorrowedBooks.find((b) => b.id === bookId);
    if (!book) {
      alert("Book not found in your borrowed books");
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
          `Returned! TX: ${response.txid}\nDeposit of ${(book["deposit-amount"] / 1000000).toFixed(2)} STX will be refunded.`,
        );
        setTimeout(async () => {
          await fetchAllBooks();
          setIsProcessing(false);
        }, 10000);
      }
    } catch (error) {
      alert(
        `Failed to return: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchAllBooks();
  }, []);

  useEffect(() => {
    const fetchUserBooks = async () => {
      if (connected && address && books.length > 0) {
        setUserBorrowedBooks(await fetchUserBorrowedBooks());
      } else {
        setUserBorrowedBooks([]);
      }
    };
    fetchUserBooks();
  }, [connected, address, books]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      <Header
        connected={connected}
        address={address}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isProcessing && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              Processing transaction... Please wait.
            </p>
          </div>
        )}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === "browse" && (
          <BrowseBooks
            books={books}
            depositAmount={DEPOSIT_AMOUNT}
            onBorrow={handleBorrowBook}
            connected={connected}
          />
        )}
        {activeTab === "add" && <AddBookForm onAdd={handleAddBook} />}
        {activeTab === "myborrow" && (
          <MyBorrows
            borrowedBooks={userBorrowedBooks}
            onReturn={handleReturnBook}
            connected={connected}
          />
        )}
      </main>
      <Footer bookCount={books.length} />
    </div>
  );
}
