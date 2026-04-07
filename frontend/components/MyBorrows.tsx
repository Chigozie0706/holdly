"use client";

import "@/styles/MyBorrows.css";
import { BookOpen, Coins, Hash, ArrowLeft, RotateCcw } from "lucide-react";

interface BorrowedBook {
  id: number;
  title: string;
  author: string;
  coverPage?: string;
  "deposit-amount": number;
  "total-borrows"?: number;
  borrowedAt?: number;
  "deposit-token": string;
}

interface MyBorrowsProps {
  borrowedBooks: BorrowedBook[];
  onReturn: (id: number) => void;
  connected: boolean;
  isLoading?: boolean;
}

export default function MyBorrows({
  borrowedBooks,
  onReturn,
  connected,
  isLoading = false,
}: MyBorrowsProps) {
  const totalDeposit = borrowedBooks.reduce(
    (sum, b) => sum + b["deposit-amount"],
    0,
  );

  return (
    <>
      <div className="my-borrows">
        {!connected && (
          <div className="wallet-notice-borrow">
            Connect your wallet to view your borrowed books.
          </div>
        )}

        <div className="borrows-header">
          <div>
            <h2 className="borrows-title">My Borrows</h2>
            <p className="borrows-sub">
              Books currently checked out under your wallet
            </p>
          </div>
        </div>

        {connected && borrowedBooks.length > 0 && (
          <div className="summary-bar">
            <div className="summary-cell">
              <p className="summary-label">Books Out</p>
              <p className="summary-value">{borrowedBooks.length}</p>
            </div>
            <div className="summary-cell">
              <p className="summary-label">Deposit Held</p>
              <p className="summary-value">
                {(totalDeposit / 1_000_000).toFixed(2)}
              </p>
              <p className="summary-sub">STX · refunded on return</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner-gold" />
            <span
              style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.25)" }}
            >
              Loading your borrowed books…
            </span>
          </div>
        ) : borrowedBooks.length === 0 ? (
          <div className="empty-state-borrow">
            <div className="empty-icon-ring">
              <BookOpen size={28} color="rgba(255,255,255,0.15)" />
            </div>
            <p className="empty-title-borrow">Nothing checked out</p>
            <p className="empty-sub-borrow">
              Head to the library and borrow your first book.
            </p>
            <button
              className="browse-link"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("changeTab", { detail: "browse" }),
                )
              }
            >
              <ArrowLeft size={13} />
              Browse Library
            </button>
          </div>
        ) : (
          <>
            <div className="borrow-list">
              {borrowedBooks.map((book) => (
                <div key={book.id} className="borrow-row">
                  <div className="borrow-cover">
                    {book.coverPage ? (
                      <img src={book.coverPage} alt={book.title} />
                    ) : (
                      <div className="borrow-cover-placeholder">
                        <BookOpen size={28} color="rgba(212,163,82,0.25)" />
                      </div>
                    )}
                  </div>

                  <div className="borrow-details">
                    <div>
                      <span className="borrow-badge">On Loan</span>
                      <h3
                        className="borrow-book-title"
                        style={{ marginTop: "0.65rem" }}
                      >
                        {book.title}
                      </h3>
                      <p className="borrow-book-author">by {book.author}</p>
                    </div>

                    <div className="borrow-info-row">
                      <div className="borrow-info-item">
                        <span className="borrow-info-label">
                          <Coins size={11} /> Deposit
                        </span>
                        <span className="borrow-info-value gold">
                          {(book["deposit-amount"] / 1_000_000).toFixed(2)}{" "}
                          {book["deposit-token"] || "STX"}
                        </span>
                      </div>
                      {(book as any).borrowedAt && (
                        <div className="borrow-info-item">
                          <span className="borrow-info-label">
                            <Hash size={11} /> Block
                          </span>
                          <span className="borrow-info-value mono">
                            {(book as any).borrowedAt}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      className="return-btn"
                      onClick={() => onReturn(book.id)}
                      disabled={!connected}
                    >
                      <RotateCcw size={13} />
                      Return & Reclaim Deposit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="tip-bar">
              Deposits are returned in full the moment your return transaction
              is confirmed on-chain.
            </div>
          </>
        )}
      </div>
    </>
  );
}
