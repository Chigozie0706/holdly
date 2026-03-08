"use client";

import React, { useState, useCallback } from "react";
import { Upload, BookPlus, X } from "lucide-react";
import { toast } from "sonner";
import { useStacks } from "@/providers/stacks-provider";

interface AddBookFormProps {
  onAdd: (title: string, author: string, coverPage: string) => void;
}

const DEPOSIT_AMOUNT = 1000000;

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .add-book-wrap {
          max-width: 640px;
          margin: 0 auto;
          font-family: 'DM Sans', sans-serif;
        }
        .add-book-header {
          margin-bottom: 2rem;
        }
        .add-book-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          margin: 0 0 0.4rem;
        }
        .add-book-sub {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.3);
          margin: 0;
        }

        .form-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 4px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .field-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .field-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.35);
          font-weight: 500;
        }
        .field-label span { color: #D4A352; }

        .field-input {
          padding: 0.75rem 1rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 2px;
          color: rgba(255,255,255,0.85);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.18); }
        .field-input:focus {
          background: rgba(255,255,255,0.06);
          border-color: rgba(212, 163, 82, 0.4);
          box-shadow: 0 0 0 3px rgba(212, 163, 82, 0.07);
        }

        .drop-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 2.5rem 1.5rem;
          border: 1px dashed rgba(255,255,255,0.12);
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .drop-zone.dragging {
          border-color: rgba(212, 163, 82, 0.5);
          background: rgba(212, 163, 82, 0.04);
        }
        .drop-zone:hover {
          border-color: rgba(212, 163, 82, 0.3);
          background: rgba(212, 163, 82, 0.025);
        }
        .drop-icon {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: rgba(212, 163, 82, 0.07);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.25rem;
        }
        .drop-text { font-size: 0.82rem; color: rgba(255,255,255,0.35); }
        .drop-text label { color: #D4A352; cursor: pointer; }
        .drop-text label:hover { text-decoration: underline; }
        .drop-hint { font-size: 0.72rem; color: rgba(255,255,255,0.2); }
        .drop-error { font-size: 0.72rem; color: #f87171; margin-top: 0.25rem; }

        .preview-wrap {
          position: relative;
          width: 100%;
          height: 200px;
          border-radius: 3px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .preview-wrap img { width: 100%; height: 100%; object-fit: contain; background: rgba(0,0,0,0.4); }
        .remove-btn {
          position: absolute;
          top: 0.6rem; right: 0.6rem;
          width: 26px; height: 26px;
          background: rgba(239, 68, 68, 0.8);
          border: none; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .remove-btn:hover { background: #ef4444; }

        .url-fallback-label {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.2);
          margin-bottom: 0.4rem;
          display: block;
        }

        .deposit-notice {
          padding: 0.85rem 1.1rem;
          background: rgba(59, 130, 246, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.15);
          border-radius: 2px;
          font-size: 0.8rem;
          color: rgba(147, 197, 253, 0.7);
          line-height: 1.5;
        }
        .deposit-notice strong { color: rgba(147, 197, 253, 0.9); }

        .wallet-notice-form {
          padding: 0.75rem 1rem;
          background: rgba(234, 179, 8, 0.05);
          border: 1px solid rgba(234, 179, 8, 0.2);
          border-radius: 2px;
          border-left: 3px solid rgba(234, 179, 8, 0.4);
          font-size: 0.8rem;
          color: rgba(234, 179, 8, 0.7);
        }

        .submit-btn {
          width: 100%;
          padding: 0.85rem 1.5rem;
          background: linear-gradient(135deg, #D4A352, #C8903A);
          color: #0a0a12;
          border: none;
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .submit-btn:hover:not(:disabled) {
          box-shadow: 0 8px 24px rgba(212, 163, 82, 0.3);
          transform: translateY(-1px);
        }
        .submit-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          transform: none;
        }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(10,10,18,0.3);
          border-top-color: rgba(10,10,18,0.8);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

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
