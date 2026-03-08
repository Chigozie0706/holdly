import React, { useState } from "react";
import { BookOpen, ArrowRight, Users } from "lucide-react";

interface BookCardProps {
  book: {
    id: number;
    title: string;
    author: string;
    coverPage?: string;
    "is-available": boolean;
    "total-borrows": number;
    "deposit-amount": number;
  };
  depositAmount: number;
  onBorrow: (id: number) => void;
  connected: boolean;
}

export default function BookCard({
  book,
  depositAmount,
  onBorrow,
  connected,
}: BookCardProps) {
  const [imgError, setImgError] = useState(false);
  const isAvailable = book["is-available"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .book-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: background 0.25s, border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .book-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(212,163,82,0.25);
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,163,82,0.08);
        }

        .book-cover {
          width: 100%; height: 200px;
          overflow: hidden; flex-shrink: 0;
          background: linear-gradient(135deg, #111120, #18182e);
          position: relative;
        }
        .book-cover img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .book-card:hover .book-cover img { transform: scale(1.05); }

        .book-cover-placeholder {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 0.6rem;
          background: rgba(212,163,82,0.03);
        }
        .book-cover-placeholder span {
          font-size: 0.65rem; text-transform: uppercase;
          letter-spacing: 0.1em; color: rgba(212,163,82,0.25);
        }

        .book-avail-badge {
          position: absolute; top: 0.7rem; right: 0.7rem;
          padding: 0.22rem 0.6rem;
          border-radius: 2px;
          font-size: 0.65rem; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          backdrop-filter: blur(8px);
        }
        .book-avail-badge.available {
          background: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.3);
          color: #4ade80;
        }
        .book-avail-badge.unavailable {
          background: rgba(239,68,68,0.09);
          border: 1px solid rgba(239,68,68,0.28);
          color: #f87171;
        }

        .book-body {
          padding: 1.2rem;
          display: flex; flex-direction: column;
          flex: 1; gap: 0.9rem;
          font-family: 'DM Sans', sans-serif;
        }
        .book-body-top { flex: 1; }
        .book-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1rem; font-weight: 600;
          color: rgba(255,255,255,0.9); line-height: 1.3; margin: 0 0 0.3rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .book-card-author {
          font-family: 'Playfair Display', serif;
          font-style: italic; font-size: 0.8rem;
          color: rgba(255,255,255,0.35); margin: 0;
        }

        .book-card-meta {
          display: flex; align-items: center;
          justify-content: space-between;
          padding-top: 0.8rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .book-meta-deposit-label {
          font-size: 0.62rem; text-transform: uppercase;
          letter-spacing: 0.1em; color: rgba(255,255,255,0.22);
          display: block; margin-bottom: 0.18rem;
        }
        .book-meta-deposit-value {
          font-size: 0.88rem; font-weight: 500; color: #D4A352;
        }
        .book-meta-borrows {
          display: flex; align-items: center; gap: 0.3rem;
          font-size: 0.72rem; color: rgba(255,255,255,0.25);
        }

        .book-borrow-btn {
          width: 100%;
          padding: 0.65rem 1rem;
          display: flex; align-items: center; justify-content: center; gap: 0.45rem;
          border: none; border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem; font-weight: 500;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
        }
        .book-borrow-btn.can-borrow {
          background: linear-gradient(135deg, #D4A352, #C8903A);
          color: #080810;
        }
        .book-borrow-btn.can-borrow:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(212,163,82,0.3);
        }
        .book-borrow-btn.can-borrow:disabled {
          opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none;
        }
        .book-borrow-btn.on-loan {
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.2);
          cursor: not-allowed;
          border: 1px solid rgba(255,255,255,0.06);
        }
      `}</style>

      <div className="book-card">
        {/* Cover */}
        <div className="book-cover">
          {book.coverPage && !imgError ? (
            <img
              src={book.coverPage}
              alt={book.title}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="book-cover-placeholder">
              <BookOpen size={30} color="rgba(212,163,82,0.3)" />
              <span>No Cover</span>
            </div>
          )}
          <span
            className={`book-avail-badge ${isAvailable ? "available" : "unavailable"}`}
          >
            {isAvailable ? "Available" : "On Loan"}
          </span>
        </div>

        {/* Body */}
        <div className="book-body">
          <div className="book-body-top">
            <h3 className="book-card-title">{book.title}</h3>
            <p className="book-card-author">by {book.author}</p>
          </div>

          <div className="book-card-meta">
            <div>
              <span className="book-meta-deposit-label">Deposit</span>
              <span className="book-meta-deposit-value">
                {(book["deposit-amount"] / 1_000_000).toFixed(2)} STX
              </span>
            </div>
            <div className="book-meta-borrows">
              <Users size={11} />
              {book["total-borrows"]}x
            </div>
          </div>

          {isAvailable ? (
            <button
              className="book-borrow-btn can-borrow"
              onClick={() => onBorrow(book.id)}
              disabled={!connected}
            >
              {connected ? (
                <>
                  {" "}
                  Borrow <ArrowRight size={13} />{" "}
                </>
              ) : (
                "Connect wallet to borrow"
              )}
            </button>
          ) : (
            <button className="book-borrow-btn on-loan" disabled>
              Currently on loan
            </button>
          )}
        </div>
      </div>
    </>
  );
}
