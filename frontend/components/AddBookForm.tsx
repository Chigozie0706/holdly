"use client";

import "@/styles/AddBookForm.css";
import React, { useState, useCallback } from "react";
import { Upload, BookPlus, X } from "lucide-react";
import { toast } from "sonner";
import { useStacks } from "@/providers/stacks-provider";

interface AddBookFormProps {
  onAdd: (title: string, author: string, coverPage: string) => void;
}

const DEPOSIT_AMOUNT = 500000;

export default function AddBookForm({ onAdd }: AddBookFormProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverPage, setCoverPage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { connected } = useStacks();
  const [depositSTX, setDepositSTX] = useState("0.50");
  const [depositToken, setDepositToken] = useState<"STX" | "sBTC">("STX");
  const MIN_DEPOSIT = 100000;

  const handleFileChange = useCallback(
    (fileOrEvent: File | React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      let selectedFile: File | null = null;
      if (fileOrEvent instanceof File) selectedFile = fileOrEvent;
      else if (fileOrEvent.target.files?.[0])
        selectedFile = fileOrEvent.target.files[0];
      if (!selectedFile) return;

      if (!selectedFile.type.startsWith("image/")) {
        const msg = "Only image files are allowed";
        setError(msg);
        toast.error(msg);
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        const msg = "File size must be less than 10MB";
        setError(msg);
        toast.error(msg);
        return;
      }

      setImageFile(selectedFile);
      setCoverPage("");
      toast.success(`"${selectedFile.name}" selected`);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
    },
    [handleFileChange],
  );

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

      toast.success("Uploaded to IPFS!", { id: toastId });
      return url;
    } catch (err) {
      toast.error("Failed to upload image.", { id: toastId });
      throw err;
    }
  };

  const handleSubmit = async () => {
    if (!title || !author) {
      toast.error("Title and author are required");
      return;
    }
    if (!connected) {
      toast.error("Connect your wallet first");
      return;
    }

    let finalCoverUrl = coverPage;
    if (imageFile) {
      setIsUploading(true);
      try {
        finalCoverUrl = await uploadToIPFS(imageFile);
      } catch {
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    onAdd(title, author, finalCoverUrl);
    setTitle("");
    setAuthor("");
    setCoverPage("");
    setImageFile(null);
    setImagePreview(null);
  };

  const canSubmit = title.trim() && author.trim() && connected && !isUploading;

  return (
    <>
      <div className="add-book-wrap">
        <div className="add-book-header">
          <h2 className="add-book-title">Donate a Book</h2>
          <p className="add-book-sub">
            Add a book to the decentralized library collection
          </p>
        </div>

        <div className="form-card">
          {!connected && (
            <div className="wallet-notice-form">
              Connect your wallet to add books to the library.
            </div>
          )}

          <div className="field-group">
            <label className="field-label">
              Book Title <span>*</span>
            </label>
            <input
              className="field-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the full title"
              maxLength={200}
            />
          </div>

          <div className="field-group">
            <label className="field-label">
              Author <span>*</span>
            </label>
            <input
              className="field-input"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author's full name"
              maxLength={100}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Cover Image</label>

            {imagePreview ? (
              <div className="preview-wrap">
                <img src={imagePreview} alt="Preview" />
                <button
                  className="remove-btn"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setError(null);
                  }}
                >
                  <X size={12} color="white" />
                </button>
              </div>
            ) : (
              <div
                className={`drop-zone ${isDragging ? "dragging" : ""}`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
              >
                <div className="drop-icon">
                  <Upload size={18} color="rgba(212,163,82,0.6)" />
                </div>
                <p className="drop-text">
                  Drop image here or{" "}
                  <label>
                    browse
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </label>
                </p>
                <p className="drop-hint">PNG, JPG, GIF · max 10MB</p>
                {error && <p className="drop-error">{error}</p>}
              </div>
            )}

            <span
              className="url-fallback-label"
              style={{ marginTop: "0.75rem" }}
            >
              Or paste an image URL:
            </span>
            <input
              className="field-input"
              type="text"
              value={coverPage}
              onChange={(e) => {
                setCoverPage(e.target.value);
                setImageFile(null);
                setImagePreview(null);
              }}
              placeholder="https://example.com/cover.jpg"
              maxLength={200}
            />
          </div>

          {/* Deposit Amount */}
          <div className="field-group">
            <label className="field-label">
              Deposit Amount <span>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                className="field-input"
                type="number"
                value={depositSTX}
                onChange={(e) => setDepositSTX(e.target.value)}
                placeholder="0.50"
                min="0.1"
                step="0.1"
              />
              <span
                style={{
                  position: "absolute",
                  right: "0.85rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.78rem",
                  color: "rgba(212,163,82,0.6)",
                  pointerEvents: "none",
                }}
              >
                {" "}
                {depositToken}
              </span>
            </div>
            <p
              style={{
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.25)",
                marginTop: "0.35rem",
              }}
            >
              Minimum 0.1 {depositToken} · Refunded to borrower on return
            </p>
          </div>

          {/* Token Selector */}
          <div className="field-group">
            <label className="field-label">Deposit Token</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {(["STX", "sBTC"] as const).map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => setDepositToken(token)}
                  className={`field-input`}
                  style={{
                    flex: 1,
                    cursor: "pointer",
                    background:
                      depositToken === token
                        ? "rgba(212,163,82,0.15)"
                        : "rgba(255,255,255,0.05)",
                    border:
                      depositToken === token
                        ? "1px solid rgba(212,163,82,0.4)"
                        : "1px solid rgba(255,255,255,0.08)",
                    color:
                      depositToken === token
                        ? "#D4A352"
                        : "rgba(255,255,255,0.4)",
                  }}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          <div className="deposit-notice">
            <strong>Free to list.</strong> Borrowers put down a{" "}
            {(DEPOSIT_AMOUNT / 1_000_000).toFixed(2)} STX deposit, fully
            refunded when they return the book.
          </div>

          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isUploading ? (
              <>
                <div className="spinner" /> Uploading to IPFS…
              </>
            ) : (
              <>
                <BookPlus size={16} /> Add to Library
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
