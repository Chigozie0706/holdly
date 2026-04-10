"use client";

import "@/styles/MyListedBooks.css";
import {
  BookOpen,
  Users,
  TrendingUp,
  Library,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Book {
  id: number;
  title: string;
  author: string;
  coverPage?: string;
  owner?: string;
  "is-available": boolean;
  "total-borrows": number;
  "deposit-amount": number;
  "deposit-token": string;
}

interface MyListedBooksProps {
  books: Book[];
  address: string | null;
  connected: boolean;
  onUpdate: (
    id: number,
    title: string,
    author: string,
    coverPage: string,
    depositAmount: number,
    depositToken: "STX" | "sBTC",
  ) => void;
  onDelete: (id: number) => void;
}

function EditRow({
  book,
  onSave,
  onCancel,
}: {
  book: Book;
  onSave: (
    title: string,
    author: string,
    coverPage: string,
    depositAmount: number,
    depositToken: "STX" | "sBTC",
  ) => void;
  onCancel: () => void;
});

{
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [coverPage, setCoverPage] = useState(book.coverPage || "");
  const [depositSTX, setDepositSTX] = useState(
    (book["deposit-amount"] / 1_000_000).toFixed(2),
  );
  const [depositToken, setDepositToken] = useState<"STX" | "sBTC">(
    (book["deposit-token"] as "STX" | "sBTC") || "STX",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Only image files allowed"); return; }

}

export default function MyListedBooks({
  books,
  address,
  connected,
  onUpdate,
  onDelete,
}: MyListedBooksProps) {
  const myBooks = books.filter((b) => b.owner === address);
  const availableCount = myBooks.filter((b) => b["is-available"]).length;
  const onLoanCount = myBooks.filter((b) => !b["is-available"]).length;
  const totalBorrows = myBooks.reduce((sum, b) => sum + b["total-borrows"], 0);
  const totalDepositsLocked =
    myBooks
      .filter((b) => !b["is-available"])
      .reduce((sum, b) => sum + b["deposit-amount"], 0) / 1_000_000;
  if (!connected) {
    return (
      <div className="dash-empty">
        <div className="dash-empty-icon">
          <Library size={28} color="rgba(212,163,82,0.3)" />
        </div>
        <p className="dash-empty-title">Connect your wallet</p>
        <p className="dash-empty-sub">Connect to view your dashboard</p>
      </div>
    );
  }

  if (myBooks.length === 0) {
    return (
      <div className="dash-empty">
        <div className="dash-empty-icon">
          <BookOpen size={28} color="rgba(212,163,82,0.3)" />
        </div>
        <p className="dash-empty-title">No books listed yet</p>
        <p className="dash-empty-sub">
          Books you add to the library will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="dash-wrap">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h2 className="dash-title">My Listed Books</h2>
          <p className="dash-sub">Books you've added to the library</p>
        </div>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        <div className="dash-stat-card">
          <Library size={18} color="#D4A352" />
          <span className="dash-stat-num">{myBooks.length}</span>
          <span className="dash-stat-lbl">Total Listed</span>
        </div>
        <div className="dash-stat-card">
          <BookOpen size={18} color="#4ade80" />
          <span className="dash-stat-num">{availableCount}</span>
          <span className="dash-stat-lbl">Available</span>
        </div>
        <div className="dash-stat-card">
          <Users size={18} color="#f87171" />
          <span className="dash-stat-num">{onLoanCount}</span>
          <span className="dash-stat-lbl">On Loan</span>
        </div>
        <div className="dash-stat-card">
          <TrendingUp size={18} color="#a78bfa" />
          <span className="dash-stat-num">{totalBorrows}</span>
          <span className="dash-stat-lbl">Total Borrows</span>
        </div>
      </div>

      {totalDepositsLocked > 0 && (
        <div className="dash-deposits-notice">
          <span className="dash-deposits-label">
            STX currently locked in deposits
          </span>
          <span className="dash-deposits-value">
            {totalDepositsLocked.toFixed(2)} STX
          </span>
        </div>
      )}

      {/* Book list */}
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Status</th>
              <th>Deposit</th>
              <th>Borrows</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {myBooks.map((book) => (
              <tr key={book.id}>
                <td>
                  <div className="dash-book-cell">
                    {book.coverPage ? (
                      <img
                        src={book.coverPage}
                        alt={book.title}
                        className="dash-book-thumb"
                        onError={(e) =>
                          ((e.target as HTMLImageElement).style.display =
                            "none")
                        }
                      />
                    ) : (
                      <div className="dash-book-thumb-placeholder">
                        <BookOpen size={14} color="rgba(212,163,82,0.3)" />
                      </div>
                    )}

                    <div>
                      <p className="dash-book-title">{book.title}</p>
                      <p className="dash-book-author">by {book.author}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={`dash-status ${book["is-available"] ? "available" : "on-loan"}`}
                  >
                    {book["is-available"] ? "Available" : "On Loan"}
                  </span>
                </td>
                <td>
                  <span className="dash-deposit">
                    {(book["deposit-amount"] / 1_000_000).toFixed(2)}{" "}
                    {book["deposit-token"] || "STX"}
                  </span>
                </td>
                <td>
                  <span className="dash-borrows">{book["total-borrows"]}x</span>
                </td>

                <td>
                  {book["is-available"] ? (
                    <div className="dash-actions">
                      <button
                        className="dash-action-btn edit"
                        onClick={() =>
                          onUpdate(
                            book.id,
                            book.title,
                            book.author,
                            book.coverPage || "",
                          )
                        }
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className="dash-action-btn delete"
                        onClick={() => onDelete(book.id)}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <span className="dash-locked">Locked</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
