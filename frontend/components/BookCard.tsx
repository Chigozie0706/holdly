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
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editDepositSTX, setEditDepositSTX] = useState(
    (book["deposit-amount"] / 1_000_000).toFixed(2),
  );

  const [editDepositToken, setEditDepositToken] = useState<"STX" | "sBTC">(
    (book["deposit-token"] as "STX" | "sBTC") || "STX",
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
