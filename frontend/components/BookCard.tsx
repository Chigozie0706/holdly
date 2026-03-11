"use client";

import React, { useState } from "react";
import {
  BookOpen,
  ArrowRight,
  Users,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";

interface BookCardProps {
  book: {
    id: number;
    title: string;
    author: string;
    coverPage?: string;
    owner?: string;
    "is-available": boolean;
    "total-borrows": number;
    "deposit-amount": number;
  };
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
}

export default function BookCard({
  book,
  depositAmount,
  onBorrow,
  onUpdate,
  onDelete,
  connected,
  address,
}: BookCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(book.title);
  const [editAuthor, setEditAuthor] = useState(book.author);
  const [editCover, setEditCover] = useState(book.coverPage || "");

  const isAvailable = book["is-available"];
  const isOwner = connected && address && book.owner && address === book.owner;
  const canManage = isOwner && isAvailable;

  const handleSave = () => {
    if (!editTitle.trim() || !editAuthor.trim()) return;
    onUpdate(book.id, editTitle, editAuthor, editCover);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(book.title);
    setEditAuthor(book.author);
    setEditCover(book.coverPage || "");
    setIsEditing(false);
  };

  return (
    <>
      <style>{`
        /* ...your existing styles... */

        .book-owner-actions {
          display: flex; gap: 0.4rem; margin-top: 0.5rem;
        }
        .book-action-btn {
          flex: 1; padding: 0.45rem 0.6rem;
          display: flex; align-items: center; justify-content: center; gap: 0.3rem;
          border-radius: 2px; font-size: 0.72rem; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .book-action-btn.edit {
          background: rgba(212,163,82,0.08);
          border: 1px solid rgba(212,163,82,0.2);
          color: #D4A352;
        }
        .book-action-btn.edit:hover {
          background: rgba(212,163,82,0.15);
          border-color: rgba(212,163,82,0.4);
        }
        .book-action-btn.delete {
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.2);
          color: #f87171;
        }
        .book-action-btn.delete:hover {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.4);
        }
        .book-action-btn.save {
          background: rgba(74,222,128,0.08);
          border: 1px solid rgba(74,222,128,0.25);
          color: #4ade80;
        }
        .book-action-btn.save:hover { background: rgba(74,222,128,0.15); }
        .book-action-btn.cancel {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.35);
        }
        .book-action-btn.cancel:hover { background: rgba(255,255,255,0.07); }

        .book-edit-input {
          width: 100%; padding: 0.45rem 0.65rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212,163,82,0.25);
          border-radius: 2px;
          color: rgba(255,255,255,0.85);
          font-size: 0.8rem;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .book-edit-input:focus {
          border-color: rgba(212,163,82,0.5);
          box-shadow: 0 0 0 3px rgba(212,163,82,0.07);
        }
        .book-edit-inputs {
          display: flex; flex-direction: column; gap: 0.4rem;
          margin-bottom: 0.5rem;
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
          {isEditing ? (
            // ── Edit mode ──
            <>
              <div className="book-edit-inputs">
                <input
                  className="book-edit-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title"
                  maxLength={200}
                />
                <input
                  className="book-edit-input"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  placeholder="Author"
                  maxLength={100}
                />
                <input
                  className="book-edit-input"
                  value={editCover}
                  onChange={(e) => setEditCover(e.target.value)}
                  placeholder="Cover image URL"
                  maxLength={200}
                />
              </div>
              <div className="book-owner-actions">
                <button className="book-action-btn save" onClick={handleSave}>
                  <Check size={12} /> Save
                </button>
                <button
                  className="book-action-btn cancel"
                  onClick={handleCancel}
                >
                  <X size={12} /> Cancel
                </button>
              </div>
            </>
          ) : (
            // ── View mode ──
            <>
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
                      <ArrowRight size={13} /> Borrow
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

              {/* Edit / Delete — only shown to owner when available */}
              {canManage && (
                <div className="book-owner-actions">
                  <button
                    className="book-action-btn edit"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil size={11} /> Edit
                  </button>
                  <button
                    className="book-action-btn delete"
                    onClick={() => onDelete(book.id)}
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
