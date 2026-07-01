"use client";

import { CONTRACT_ADDRESS, CONTRACT_NAME } from "@/config/contract";
import "@/styles/MyBorrows.css";
import { BookOpen, Coins, RotateCcw, Clock } from "lucide-react";
import {
  formatTimeRemaining,
  formatDueDate,
  borrowDurationLabel,
} from "@/lib/blockTime";

import { useState } from "react";
import { toast } from "sonner";

interface BorrowedBook {
  id: number;
  title: string;
  author: string;
  coverPage?: string;
  "deposit-amount": number;
  "total-borrows"?: number;
  borrowedAt?: number;
  dueDate?: number;
  "deposit-token": string;
}

interface MyBorrowsProps {
  borrowedBooks: BorrowedBook[];
  onReturn: (id: number) => void;
  connected: boolean;
  isLoading?: boolean;
  currentBlock: number;
}

export default function MyBorrows({
  borrowedBooks,
  onReturn,
  connected,
  isLoading = false,
  currentBlock,
}: MyBorrowsProps) {
  const [ratingBookId, setRatingBookId] = useState<number | null>(null);

  const totalDeposit = borrowedBooks.reduce(
    (sum, b) => sum + b["deposit-amount"],
    0,
  );

  const handleRate = async (bookId: number, score: number) => {
    if (!connected) return;

    try {
      const { request } = await import("@stacks/connect");
      const { Cl } = await import("@stacks/transactions");

      const response = await request("stx_callContract", {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: "rate-book",
        functionArgs: [Cl.uint(bookId), Cl.uint(score)],
      });

      if (response.txid) {
        toast.success("Rating submitted!");
        setRatingBookId(null);
      }
    } catch (error) {
      toast.error(
        `Failed to rate: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return (
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
        </div>
      ) : (
        <>
          <div className="borrow-list">
            {borrowedBooks.map((book) => {
              //  Only compute timeInfo once currentBlock has loaded
              const timeInfo =
                book.dueDate && currentBlock > 0
                  ? formatTimeRemaining(currentBlock, book.dueDate)
                  : null;

              const urgencyColor = timeInfo
                ? {
                    safe: "rgba(74,222,128,0.7)",
                    warning: "#D4A352",
                    danger: "#f87171",
                    overdue: "#ef4444",
                  }[timeInfo.urgency]
                : "rgba(255,255,255,0.4)";

              return (
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
                      <span
                        className={`borrow-badge ${timeInfo?.isOverdue ? "overdue" : ""}`}
                      >
                        {timeInfo?.isOverdue ? "Overdue" : "On Loan"}
                      </span>
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

                      {/*  Only show when currentBlock is loaded */}
                      {timeInfo && (
                        <div className="borrow-info-item">
                          <span className="borrow-info-label">
                            <Clock size={11} />{" "}
                            {timeInfo.isOverdue ? "Status" : "Due"}
                          </span>
                          <span
                            className="borrow-info-value"
                            style={{ color: urgencyColor, fontWeight: 500 }}
                          >
                            {timeInfo.label}
                          </span>
                        </div>
                      )}
                    </div>

                    {/*  Guard with currentBlock > 0 */}
                    {book.dueDate && currentBlock > 0 && (
                      <p
                        style={{
                          fontSize: "0.68rem",
                          color: "rgba(255,255,255,0.2)",
                          margin: "0.2rem 0 0.6rem",
                        }}
                      >
                        Due by {formatDueDate(currentBlock, book.dueDate)}
                      </p>
                    )}

                    {timeInfo?.isOverdue && (
                      <div
                        style={{
                          padding: "0.5rem 0.75rem",
                          marginBottom: "0.6rem",
                          background: "rgba(239,68,68,0.07)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: "2px",
                          fontSize: "0.72rem",
                          color: "rgba(239,68,68,0.85)",
                        }}
                      >
                        This book is overdue. Return it now or the owner may
                        claim your deposit.
                      </div>
                    )}

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
              );
            })}
          </div>

          <div className="tip-bar">
            Deposits are returned in full the moment your return transaction is
            confirmed on-chain. Late returns send the deposit to the book owner
            instead.
          </div>
        </>
      )}
    </div>
  );
}
