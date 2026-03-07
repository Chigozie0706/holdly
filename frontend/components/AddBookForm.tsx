"use client";

import React, { useState, useCallback } from "react";
import { Plus, Upload } from "lucide-react";
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
  const { connected } = useStacks();

  const handleFileChange = useCallback(
    (fileOrEvent: File | React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      let selectedFile: File | null = null;

      if (fileOrEvent instanceof File) selectedFile = fileOrEvent;
      else if (fileOrEvent.target.files?.[0])
        selectedFile = fileOrEvent.target.files[0];
      if (!selectedFile) return;

      // Validate type
      if (!selectedFile.type.startsWith("image/")) {
        const msg = "Only image files are allowed (JPG, PNG, GIF, etc.)";
        setError(msg);
        toast.error(msg);
        return;
      }

      // Validate size
      if (selectedFile.size > 10 * 1024 * 1024) {
        const msg = "File size must be less than 10MB";
        setError(msg);
        toast.error(msg);
        return;
      }

      setImageFile(selectedFile);
      setCoverPage(""); // clear manual URL if file selected
      toast.success(`Image "${selectedFile.name}" selected`, { icon: "🖼️" });

      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
    },
    [handleFileChange],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setError(null);
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    const toastId = toast.loading("Uploading image to IPFS…");
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
      const url = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${data.IpfsHash}`;

      toast.success("Image uploaded to IPFS!", { id: toastId });
      return url;
    } catch (err) {
      toast.error("Failed to upload image. Please try again.", { id: toastId });
      throw err;
    }
  };

  const handleSubmit = async () => {
    if (!title || !author) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!connected) {
      toast.error("Please connect your wallet first");
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-orange-500 to-purple-600 p-2 rounded-lg">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Add New Book</h2>
        </div>

        {!connected && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Please connect your wallet to add books
            </p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Book Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter book title"
              maxLength={200}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author Name *
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter author name"
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>

            {imagePreview ? (
              // Preview with remove button
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain bg-gray-50"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    className="w-3 h-3 stroke-current fill-none"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Remove
                </button>
              </div>
            ) : (
              // Drag & drop zone
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  Drop your image here or{" "}
                  <label className="text-orange-500 cursor-pointer hover:underline">
                    browse
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, GIF — max 10MB
                </p>
                {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
              </div>
            )}

            {/* Manual URL fallback */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">
                Or enter a URL manually:
              </p>
              <input
                type="text"
                value={coverPage}
                onChange={(e) => {
                  setCoverPage(e.target.value);
                  setImageFile(null);
                  setImagePreview(null);
                }}
                placeholder="https://example.com/cover.jpg"
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Adding a book is free. Borrowers deposit{" "}
              {(DEPOSIT_AMOUNT / 1000000).toFixed(2)} STX, refunded on return.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title || !author || !connected || isUploading}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                Uploading to IPFS...
              </span>
            ) : (
              "Add Book to Library"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
