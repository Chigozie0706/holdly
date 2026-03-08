import React from "react";
import { BookOpen, Coins, Hash, ArrowLeft, RotateCcw } from "lucide-react";

interface BorrowedBook {
  id: number;
  title: string;
  author: string;
  coverPage?: string;
  "deposit-amount": number;
  "total-borrows"?: number;
  borrowedAt?: number;
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap');

        .my-borrows { font-family: 'DM Sans', sans-serif; }

        .borrows-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 1.75rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .borrows-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          margin: 0 0 0.25rem;
        }
        .borrows-sub {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.3);
          margin: 0;
        }

        .summary-bar {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212, 163, 82, 0.15);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 2rem;
        }
        .summary-cell {
          background: rgba(212, 163, 82, 0.04);
          padding: 1.25rem 1.5rem;
        }
        .summary-label {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.25);
          margin: 0 0 0.4rem;
        }
        .summary-value {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #D4A352;
          margin: 0;
          line-height: 1;
        }
        .summary-sub {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.2);
          margin: 0.3rem 0 0;
        }

        .wallet-notice-borrow {
          padding: 0.85rem 1.25rem;
          background: rgba(234, 179, 8, 0.06);
          border: 1px solid rgba(234, 179, 8, 0.2);
          border-left: 3px solid rgba(234, 179, 8, 0.5);
          border-radius: 2px;
          font-size: 0.82rem;
          color: rgba(234, 179, 8, 0.8);
          margin-bottom: 1.5rem;
        }

        .empty-state-borrow {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 2rem;
          border: 1px dashed rgba(255,255,255,0.07);
          border-radius: 4px;
          text-align: center;
          gap: 1rem;
        }
        .empty-icon-ring {
          width: 72px; height: 72px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: center;
        }
        .empty-title-borrow {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          color: rgba(255,255,255,0.5);
          margin: 0;
        }
        .empty-sub-borrow {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.2);
          margin: 0;
          max-width: 280px;
        }
        .browse-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.1rem;
          background: transparent;
          border: 1px solid rgba(212, 163, 82, 0.3);
          border-radius: 2px;
          color: #D4A352;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.25rem;
        }
        .browse-link:hover {
          background: rgba(212, 163, 82, 0.07);
          border-color: rgba(212, 163, 82, 0.5);
        }

        .borrow-list { display: flex; flex-direction: column; gap: 1rem; }

        .borrow-row {
          display: grid;
          grid-template-columns: 140px 1fr;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 4px;
          overflow: hidden;
          transition: all 0.2s;
        }
        .borrow-row:hover {
          border-color: rgba(212, 163, 82, 0.2);
          background: rgba(255,255,255,0.035);
        }

        .borrow-cover {
          height: 100%;
          min-height: 160px;
          background: linear-gradient(135deg, #1a1a2e, #16213e);
          overflow: hidden;
        }
        .borrow-cover img {
          width: 100%; height: 100%;
          object-fit: cover;
        }
        .borrow-cover-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(212, 163, 82, 0.04);
        }

        .borrow-details {
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 1rem;
        }

        .borrow-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.2rem 0.6rem;
          background: rgba(212, 163, 82, 0.1);
          border: 1px solid rgba(212, 163, 82, 0.25);
          border-radius: 2px;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #D4A352;
          width: fit-content;
        }
        .borrow-badge::before {
          content: '';
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #D4A352;
        }

        .borrow-book-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          margin: 0 0 0.2rem;
        }
        .borrow-book-author {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.35);
          margin: 0;
        }

        .borrow-info-row {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .borrow-info-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .borrow-info-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .borrow-info-value {
          font-size: 0.9rem;
          font-weight: 500;
          color: rgba(255,255,255,0.75);
        }
        .borrow-info-value.gold { color: #D4A352; }
        .borrow-info-value.mono {
          font-family: 'DM Mono', monospace;
          font-size: 0.8rem;
        }

        .return-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          background: transparent;
          border: 1px solid rgba(74, 222, 128, 0.35);
          border-radius: 2px;
          color: rgba(74, 222, 128, 0.8);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          width: fit-content;
        }
        .return-btn:hover:not(:disabled) {
          background: rgba(74, 222, 128, 0.07);
          border-color: rgba(74, 222, 128, 0.6);
          color: #4ade80;
          box-shadow: 0 4px 16px rgba(74, 222, 128, 0.12);
        }
        .return-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .tip-bar {
          margin-top: 1.5rem;
          padding: 0.85rem 1.1rem;
          background: rgba(59, 130, 246, 0.04);
          border: 1px solid rgba(59, 130, 246, 0.12);
          border-radius: 2px;
          font-size: 0.78rem;
          color: rgba(147, 197, 253, 0.55);
          line-height: 1.5;
        }

        .loading-state {
          display: flex; flex-direction: column; align-items: center;
          padding: 5rem 2rem; gap: 1rem;
        }
        .spinner-gold {
          width: 36px; height: 36px;
          border: 2px solid rgba(212, 163, 82, 0.15);
          border-top-color: #D4A352;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 520px) {
          .borrow-row { grid-template-columns: 1fr; }
          .borrow-cover { min-height: 180px; }
        }
      `}</style>

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
                          {(book["deposit-amount"] / 1_000_000).toFixed(2)} STX
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
