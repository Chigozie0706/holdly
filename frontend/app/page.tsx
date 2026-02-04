"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import WelcomeScreen from "@/components/WelcomeScreen";
import TabNavigation from "@/components/TabNavigation";
import BrowseBooks from "@/components/BrowseBooks";
import AddBookForm from "@/components/AddBookForm";
import MyBorrows from "@/components/MyBorrows";
import Footer from "@/components/Footer";

const DEPOSIT_AMOUNT = 100000;

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [books, setBooks] = useState([
    {
      id: 1,
      title: "The Bitcoin Standard",
      author: "Saifedean Ammous",
      "is-available": true,
      "total-borrows": 5,
    },
    {
      id: 2,
      title: "Mastering Bitcoin",
      author: "Andreas Antonopoulos",
      "is-available": false,
      "total-borrows": 12,
    },
    {
      id: 3,
      title: "The Blocksize War",
      author: "Jonathan Bier",
      "is-available": true,
      "total-borrows": 3,
    },
  ]);
  const [activeTab, setActiveTab] = useState("browse");

  const connectWallet = () => {
    // TODO: Implement actual wallet connection with @stacks/connect
    // setUserData({ address: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM" });
  };

  const disconnectWallet = () => {
    setUserData(null);
  };

  const handleAddBook = (title: string, author: string) => {
    const id = books.length + 1;
    setBooks([
      ...books,
      {
        id,
        title,
        author,
        "is-available": true,
        "total-borrows": 0,
      },
    ]);
    setActiveTab("browse");
  };

  const handleBorrowBook = (bookId: number) => {
    // TODO: Implement actual contract call with @stacks/connect
    setBooks(
      books.map((book) =>
        book.id === bookId
          ? {
              ...book,
              "is-available": false,
              "total-borrows": book["total-borrows"] + 1,
            }
          : book,
      ),
    );
  };

  const handleReturnBook = (bookId: number) => {
    // TODO: Implement actual contract call with @stacks/connect
    setBooks(
      books.map((book) =>
        book.id === bookId ? { ...book, "is-available": true } : book,
      ),
    );
  };

  const borrowedBooks = books.filter((book) => !book["is-available"]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      <Header
        userData={userData}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!userData ? (
          <WelcomeScreen onConnect={connectWallet} />
        ) : (
          <>
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === "browse" && (
              <BrowseBooks
                books={books}
                depositAmount={DEPOSIT_AMOUNT}
                onBorrow={handleBorrowBook}
              />
            )}

            {activeTab === "add" && (
              <AddBookForm
                depositAmount={DEPOSIT_AMOUNT}
                onAdd={handleAddBook}
              />
            )}

            {activeTab === "myborrow" && (
              <MyBorrows
                borrowedBooks={borrowedBooks}
                onReturn={handleReturnBook}
              />
            )}
          </>
        )}
      </main>

      <Footer bookCount={books.length} />
    </div>
  );
}
