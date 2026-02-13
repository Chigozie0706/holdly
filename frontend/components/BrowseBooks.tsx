import React, { useState } from "react";
import { Search, BookOpen } from "lucide-react";
import BookCard from "./BookCard";

interface BrowseBooksProps {
  books: any[];
  depositAmount: number;
  onBorrow: (id: number) => void;
  connected: boolean;
}

export default function BrowseBooks({
  books,
  depositAmount,
  onBorrow,
  connected,
}: BrowseBooksProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      {!connected && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            Connect your wallet to borrow books
          </p>
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              No books found. Try a different search.
            </p>
          </div>
        ) : (
          filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              depositAmount={depositAmount}
              onBorrow={onBorrow}
              connected={connected}
            />
          ))
        )}
      </div>
    </div>
  );
}
