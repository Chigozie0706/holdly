import React from "react";
import { BookOpen } from "lucide-react";

interface BookCardProps {
  book: {
    id: number;
    title: string;
    author: string;
    "is-available": boolean;
    "total-borrows": number;
  };
  depositAmount: number;
  onBorrow: (id: number) => void;
  connected: boolean;
}

export default function BookCard({
  book,
  depositAmount,
  onBorrow,
  connected,
}: BookCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-gradient-to-br from-orange-100 to-purple-100 p-3 rounded-lg">
            <BookOpen className="h-6 w-6 text-orange-600" />
          </div>
          {book["is-available"] ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Available
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              Borrowed
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {book.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">by {book.author}</p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>Deposit: {depositAmount.toLocaleString()} sats</span>
          <span>Borrowed {book["total-borrows"]}x</span>
        </div>

        {book["is-available"] ? (
          <button
            onClick={() => onBorrow(book.id)}
            disabled={!connected}
            className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connected ? "Borrow Book" : "Connect Wallet to Borrow"}
          </button>
        ) : (
          <button
            disabled
            className="w-full px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed font-medium"
          >
            Currently Borrowed
          </button>
        )}
      </div>
    </div>
  );
}
