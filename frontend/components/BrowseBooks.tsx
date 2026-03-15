"use client";

import "@/styles/BrowseBooks.css";
import React, { useState } from "react";
import { Search, Library } from "lucide-react";
import BookCard from "./BookCard";

interface BrowseBooksProps {
  books: any[];
  depositAmount: number;
  onBorrow: (id: number) => void;
  onUpdate: (
    id: number,
    title: string,
    author: string,
    coverPage: string,
  ) => void;
  onDelete: (id: number) => void;
  connected: boolean;
  address: string | null;
  isLoading?: boolean;
}

export default function BrowseBooks({
  books,
  depositAmount,
  onBorrow,
  onUpdate,
  onDelete,
  connected,
  address,
  isLoading = false,
}: BrowseBooksProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "borrowed">("all");

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "available" && book["is-available"]) ||
      (filter === "borrowed" && !book["is-available"]);
    return matchesSearch && matchesFilter;
  });

  const availableCount = books.filter((b) => b["is-available"]).length;

  return (
    <>
      <div className="browse-wrap">
        {!connected && (
          <div className="browse-wallet-notice">
            Connect your wallet to borrow books from the library.
          </div>
        )}

        <div className="browse-header">
          <div>
            <h2 className="browse-title">The Collection</h2>
            <p className="browse-sub">
              Browse and borrow from the decentralized library
            </p>
          </div>
          <div className="browse-stats">
            <div className="bstat">
              <span className="bstat-num">{books.length}</span>
              <span className="bstat-lbl">Total</span>
            </div>
            <div className="bstat">
              <span className="bstat-num">{availableCount}</span>
              <span className="bstat-lbl">Available</span>
            </div>
          </div>
        </div>

        <div className="browse-controls">
          <div className="browse-search-wrap">
            <Search
              size={15}
              color="rgba(255,255,255,0.22)"
              className="browse-search-icon"
            />
            <input
              className="browse-search-input"
              type="text"
              placeholder="Search by title or author…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="browse-filters">
            {(["all", "available", "borrowed"] as const).map((f) => (
              <button
                key={f}
                className={`browse-filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="books-skeleton-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="book-skeleton">
                <div className="skel-cover" />
                <div className="skel-body">
                  <div className="skel-line w80" />
                  <div className="skel-line w55" />
                  <div className="skel-line w70" />
                  <div className="skel-line w55" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="books-grid">
            {filteredBooks.length === 0 ? (
              <div className="books-empty">
                <div className="books-empty-icon">
                  <Library size={26} color="rgba(255,255,255,0.18)" />
                </div>
                <p className="books-empty-title">No books found</p>
                <p className="books-empty-sub">
                  {searchQuery
                    ? "Try a different search term."
                    : "The library is empty. Be the first to donate a book!"}
                </p>
              </div>
            ) : (
              filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  depositAmount={depositAmount}
                  onBorrow={onBorrow}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  connected={connected}
                  address={address}
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
