"use client";

import React, { useState, useEffect } from "react";
import TabNavigation from "@/components/TabNavigation";
import BrowseBooks from "@/components/BrowseBooks";
import AddBookForm from "@/components/AddBookForm";
import MyBorrows from "@/components/MyBorrows";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useStacks } from "@/providers/stacks-provider";
import { request } from "@stacks/connect";
import { Cl, cvToJSON } from "@stacks/transactions";
import { fetchCallReadOnlyFunction } from "@stacks/transactions";
import { STACKS_TESTNET } from "@stacks/network";

const DEPOSIT_AMOUNT = 100000;
const CONTRACT_ADDRESS = "ST3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJAGZBY3K";
const CONTRACT_NAME = "holdlyv1";

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

  const fetchAllBooks = async () => {
    try {
      setIsFetchingBooks(true);
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

      console.log(`Total books in contract: ${totalBooks}`);

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

          // Check if book exists (optional return)
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
      console.log(`Fetched ${fetchedBooks.length} books`);
    } catch (error) {
      console.error("Error fetching books:", error);
      // Fallback to empty array or show error to user
      setBooks([]);
    } finally {
      setIsFetchingBooks(false);
    }
  };

  // Fetch books on component mount
  useEffect(() => {
    fetchAllBooks();
  }, []);

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
      const functionArgs = [
        Cl.stringUtf8(title),
        Cl.stringUtf8(author),
        Cl.stringUtf8(coverPage || "https://via.placeholder.com/150"),
        Cl.uint(DEPOSIT_AMOUNT),
      ];

      const response = await request("stx_callContract", {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: "add-book",
        functionArgs,
      });

      if (response.txid) {
        console.log("Book added! Transaction ID:", response.txid);

        // Optimistically update UI
        const newBook: Book = {
          id: books.length + 1,
          title,
          author,
          coverPage,
          "is-available": true,
          "total-borrows": 0,
          "deposit-amount": DEPOSIT_AMOUNT,
        };
        setBooks([...books, newBook]);
        setActiveTab("browse");

        alert(`Book added successfully! TX ID: ${response.txid}`);
      }
    } catch (error) {
      console.error("Error adding book:", error);
      alert(
        `Failed to add book: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBorrowBook = async (bookId: number) => {
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }

    const book = books.find((b) => b.id === bookId);
    if (!book || !book["is-available"]) {
      alert("Book is not available");
      return;
    }

    setIsProcessing(true);
    try {
      const functionArgs = [Cl.uint(bookId)];

      const response = await request("stx_callContract", {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: "borrow-book",
        functionArgs,
      });

      if (response.txid) {
        console.log("Book borrowed! Transaction ID:", response.txid);

        // Update UI
        setBooks(
          books.map((b) =>
            b.id === bookId
              ? {
                  ...b,
                  "is-available": false,
                  "total-borrows": b["total-borrows"] + 1,
                }
              : b,
          ),
        );

        alert(
          `Book borrowed successfully! You've deposited ${DEPOSIT_AMOUNT.toLocaleString()} sats. TX ID: ${response.txid}`,
        );
      }
    } catch (error) {
      console.error("Error borrowing book:", error);
      alert(
        `Failed to borrow book: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnBook = async (bookId: number) => {
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }

    setIsProcessing(true);
    try {
      const functionArgs = [Cl.uint(bookId)];

      const response = await request("stx_callContract", {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: "return-book",
        functionArgs,
      });

      if (response.txid) {
        console.log("Book returned! Transaction ID:", response.txid);

        // Update UI
        setBooks(
          books.map((b) =>
            b.id === bookId ? { ...b, "is-available": true } : b,
          ),
        );

        alert(
          `Book returned successfully! Your ${DEPOSIT_AMOUNT.toLocaleString()} sats deposit has been refunded. TX ID: ${response.txid}`,
        );
      }
    } catch (error) {
      console.error("Error returning book:", error);
      alert(
        `Failed to return book: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const borrowedBooks = books.filter((book) => !book["is-available"]);

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
            borrowedBooks={borrowedBooks}
            onReturn={handleReturnBook}
            connected={connected}
          />
        )}
      </main>

      <Footer bookCount={books.length} />
    </div>
  );
}
