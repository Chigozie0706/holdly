import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useStacks } from "@/providers/stacks-provider";

interface AddBookFormProps {
  onAdd: (title: string, author: string, coverPage: string) => void;
}

export default function AddBookForm({ onAdd }: AddBookFormProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverPage, setCoverPage] = useState("");
  const { address, connected } = useStacks();

  const handleSubmit = () => {
    if (!title || !author) {
      alert("Please fill in all required fields");
      return;
    }

    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }

    onAdd(title, author, coverPage);
    setTitle("");
    setAuthor("");
    setCoverPage("");
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Page URL (optional)
            </label>
            <input
              type="text"
              value={coverPage}
              onChange={(e) => setCoverPage(e.target.value)}
              placeholder="https://example.com/cover.jpg"
              maxLength={200}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Adding a book is free. Anyone can borrow it
              by depositing 100,000 satoshis in sBTC, which they'll get back
              when they return the book.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title || !author || !connected}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Book to Library
          </button>
        </div>
      </div>
    </div>
  );
}
