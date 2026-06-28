"use client";

import "@/styles/BookCard.css";
import React, { useState } from "react";
import {
  BookOpen,
  ArrowRight,
  Users,
  Pencil,
  Trash2,
  X,
  Check,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { borrowDurationLabel } from "@/lib/blockTime";

function StarRating({ average, count }: { average: number; count: number }) {
  const stars = average / 10;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: "0.7rem",
            color:
              star <= Math.round(stars) ? "#D4A352" : "rgba(255,255,255,0.15)",
          }}
        >
          ★
        </span>
      ))}

      <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.25)" }}>
        {count > 0 ? `${stars.toFixed(1)} (${count})` : "No ratings"}
      </span>
    </div>
  );
}

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
    "deposit-token": string;
    "borrow-duration"?: number;
    rating?: { average: number; count: number };
  };
  depositAmount: number;
  onBorrow: (id: number) => void;
  onUpdate: (
    id: number,
    title: string,
    author: string,
    coverPage: string,
    depositAmount: number,
    depositToken: "STX" | "sBTC",
    borrowDuration: number,
  ) => void;
  onDelete: (id: number) => void;
  onRate?: (id: number, score: number) => void;
  connected: boolean;
  address: string | null;
}

export default function BookCard({
  book,
  depositAmount,
  onBorrow,
  onUpdate,
  onDelete,
  onRate,
  connected,
  address,
}: BookCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(book.title);
  const [editAuthor, setEditAuthor] = useState(book.author);
  const [editCover, setEditCover] = useState(book.coverPage || "");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editDepositSTX, setEditDepositSTX] = useState(
    (book["deposit-amount"] / 1_000_000).toFixed(2),
  );

  const [editDepositToken, setEditDepositToken] = useState<"STX" | "sBTC">(
    (book["deposit-token"] as "STX" | "sBTC") || "STX",
  );

  const [editBorrowDays, setEditBorrowDays] = useState(
    String(Math.round((book["borrow-duration"] ?? 1008) / 144)),
  );
  const isAvailable = book["is-available"];
  const isOwner = connected && address && book.owner && address === book.owner;
  const canManage = isOwner && isAvailable;

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }

    setEditFile(file);
    setEditCover("");
    const reader = new FileReader();
    reader.onload = () => setEditPreview(reader.result as string);
    reader.readAsDataURL(file);
    toast.success(`Image "${file.name}" selected`, { icon: "🖼️" });
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    const toastId = toast.loading("Uploading to IPFS…");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "pinataMetadata",
        JSON.stringify({ name: `holdly-cover-${Date.now()}` }),
      );

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
          },
          body: formData,
        },
      );

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      // const url = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${data.IpfsHash}`;
      const url = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;

      toast.success("Image uploaded to IPFS!", { id: toastId });
      return url;
    } catch (err) {
      toast.error("Failed to upload image", { id: toastId });
      throw err;
    }
  };

  const handleSave = async () => {
    if (!editTitle.trim() || !editAuthor.trim()) {
      toast.error("Title and author are required");
      return;
    }

    const depositMicro = Math.floor(
      parseFloat(editDepositSTX || "0") * 1_000_000,
    );
    if (depositMicro < 100000) {
      toast.error("Minimum deposit is 0.1");
      return;
    }

    const borrowDurationBlocks = Number(editBorrowDays) * 144;

    if (borrowDurationBlocks < 144 || borrowDurationBlocks > 4320) {
      toast.error("Borrow duration must be between 1 and 30 days");
      return;
    }

    setIsUploading(true);
    try {
      let finalCover = editCover;
      if (editFile) {
        finalCover = await uploadToIPFS(editFile);
      }

      onUpdate(
        book.id,
        editTitle,
        editAuthor,
        finalCover,
        depositMicro,
        editDepositToken,
        borrowDurationBlocks,
      );
      setIsEditing(false);
      setEditFile(null);
      setEditPreview(null);
    } catch {
      // toast already shown in uploadToIPFS
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(book.title);
    setEditAuthor(book.author);
    setEditCover(book.coverPage || "");
    setEditDepositSTX((book["deposit-amount"] / 1_000_000).toFixed(2));
    setEditDepositToken((book["deposit-token"] as "STX" | "sBTC") || "STX");
    setEditBorrowDays(
      String(Math.round((book["borrow-duration"] ?? 1008) / 144)),
    );
    setEditFile(null);
    setEditPreview(null);
    setIsEditing(false);
  };

  return (
    <>
      <div className="book-card">
        {/* Cover */}
        <div className="book-cover">
          {/* Show edit preview in cover if user selected a new image */}
          {isEditing && editPreview ? (
            <img src={editPreview} alt="New cover preview" />
          ) : book.coverPage && !imgError ? (
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

                {/* Image upload */}
                {editPreview ? (
                  <div className="book-edit-img-preview">
                    <img src={editPreview} alt="Preview" />
                    <button
                      className="book-edit-img-remove"
                      onClick={() => {
                        setEditFile(null);
                        setEditPreview(null);
                      }}
                    >
                      <X size={10} /> Remove
                    </button>
                  </div>
                ) : (
                  <label className="book-edit-upload-label">
                    <Upload size={12} /> Upload new cover
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditFileChange}
                      style={{ display: "none" }}
                    />
                  </label>
                )}

                {/* URL input — hidden when file is selected */}
                {!editFile && (
                  <input
                    className="book-edit-input"
                    value={editCover}
                    onChange={(e) => setEditCover(e.target.value)}
                    placeholder="Or paste image URL"
                    maxLength={200}
                  />
                )}

                {/*  Deposit amount */}
                <div style={{ position: "relative" }}>
                  <input
                    className="book-edit-input"
                    type="number"
                    value={editDepositSTX}
                    onChange={(e) => setEditDepositSTX(e.target.value)}
                    placeholder="Deposit amount"
                    min="0.1"
                    step="0.1"
                  />

                  <span
                    style={{
                      position: "absolute",
                      right: "0.65rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "0.72rem",
                      color: "rgba(212,163,82,0.6)",
                      pointerEvents: "none",
                    }}
                  >
                    {" "}
                    {editDepositToken}
                  </span>
                </div>

                {/* Token selector */}
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  {(["STX", "sBTC"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditDepositToken(t)}
                      style={{
                        flex: 1,
                        padding: "0.38rem",
                        borderRadius: "2px",
                        fontSize: "0.72rem",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        background:
                          editDepositToken === t
                            ? "rgba(212,163,82,0.12)"
                            : "rgba(255,255,255,0.04)",
                        border:
                          editDepositToken === t
                            ? "1px solid rgba(212,163,82,0.35)"
                            : "1px solid rgba(255,255,255,0.08)",
                        color:
                          editDepositToken === t
                            ? "#D4A352"
                            : "rgba(255,255,255,0.35)",
                      }}
                    >
                      {" "}
                      {t}
                    </button>
                  ))}
                </div>

                {/*  Borrow duration selector */}
                <div>
                  <p
                    style={{
                      fontSize: "0.65rem",
                      color: "rgba(255,255,255,0.25)",
                      margin: "0.3rem 0 0.4rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Borrow Duration
                  </p>

                  <div></div>
                </div>
              </div>

              <div className="book-owner-actions">
                <button
                  className="book-action-btn save"
                  onClick={handleSave}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <span className="spin" /> Uploading
                    </>
                  ) : (
                    <>
                      <Check size={12} /> Save
                    </>
                  )}
                </button>
                <button
                  className="book-action-btn cancel"
                  onClick={handleCancel}
                  disabled={isUploading}
                >
                  <X size={12} /> Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="book-body-top">
                <h3 className="book-card-title">{book.title}</h3>
                <p className="book-card-author">by {book.author}</p>
              </div>

              <div className="book-card-meta">
                <div>
                  <span className="book-meta-deposit-label">Deposit</span>
                  <span className="book-meta-deposit-value">
                    {(book["deposit-amount"] / 1_000_000).toFixed(2)}{" "}
                    {book["deposit-token"] || "STX"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "0.2rem",
                  }}
                >
                  <div className="book-meta-borrows">
                    <Users size={11} />
                    {book["total-borrows"]}x
                  </div>
                  {book.rating && (
                    <StarRating
                      average={book.rating.average}
                      count={book.rating.count}
                    />
                  )}
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
