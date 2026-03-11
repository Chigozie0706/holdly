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
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
    setEditCover(""); // clear manual URL
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

    setIsUploading(true);
    try {
      let finalCover = editCover;

      if (editFile) {
        finalCover = await uploadToIPFS(editFile);
      }

      onUpdate(book.id, editTitle, editAuthor, finalCover);
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

        .book-owner-actions {
          display: flex; gap: 0.4rem;
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
        .book-action-btn:disabled {
          opacity: 0.5; cursor: not-allowed;
        }

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

        .book-edit-img-preview {
          position: relative; height: 80px;
          border-radius: 2px; overflow: hidden;
        }
        .book-edit-img-preview img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .book-edit-img-remove {
          position: absolute; top: 4px; right: 4px;
          background: rgba(0,0,0,0.65); border: none; border-radius: 2px;
          color: white; cursor: pointer; padding: 2px 6px;
          font-size: 0.68rem; display: flex; align-items: center; gap: 3px;
        }
        .book-edit-upload-label {
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          padding: 0.45rem;
          border: 1px dashed rgba(212,163,82,0.3);
          border-radius: 2px; cursor: pointer;
          font-size: 0.75rem; color: rgba(212,163,82,0.7);
          transition: all 0.15s;
        }
        .book-edit-upload-label:hover {
          border-color: rgba(212,163,82,0.6);
          color: #D4A352;
          background: rgba(212,163,82,0.05);
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin {
          display: inline-block; width: 10px; height: 10px;
          border: 2px solid #4ade80; border-top-color: transparent;
          border-radius: 50%; animation: spin 0.6s linear infinite;
        }
      `}</style>

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
