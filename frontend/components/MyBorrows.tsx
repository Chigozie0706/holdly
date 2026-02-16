import React from "react";
import { Unlock, BookOpen, Calendar, Coins, ArrowLeft } from "lucide-react";

interface BorrowedBook {
  id: number;
  title: string;
  author: string;
  coverPage?: string;
  "deposit-amount": number;
  "total-borrows"?: number;
  borrowedAt?: number;
}

interface MyBorrowsProps {
  borrowedBooks: BorrowedBook[];
  onReturn: (id: number) => void;
  connected: boolean;
  isLoading?: boolean;
}

export default function MyBorrows({
  borrowedBooks,
  onReturn,
  connected,
  isLoading = false,
}: MyBorrowsProps) {
  const totalDeposit = borrowedBooks.reduce(
    (sum, book) => sum + book["deposit-amount"],
    0,
  );

  return (
    <div className="py-6">
      {!connected && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 font-medium">
                Please connect your wallet to view your borrowed books
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Card */}
      {connected && borrowedBooks.length > 0 && (
        <div className="mb-6 bg-gradient-to-br from-orange-50 to-purple-50 rounded-xl p-6 border border-orange-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                Books Borrowed
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {borrowedBooks.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                Total Deposit Locked
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {(totalDeposit / 1000000).toFixed(2)} STX
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ≈ ${((totalDeposit / 1000000) * 25).toFixed(2)} USD
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your borrowed books...</p>
        </div>
      ) : borrowedBooks.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Borrowed Books
          </h3>
          <p className="text-gray-600 mb-6">
            You haven't borrowed any books yet. Browse the library to get
            started!
          </p>
          <button
            onClick={() => {
              const event = new CustomEvent("changeTab", { detail: "browse" });
              window.dispatchEvent(event);
            }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:from-orange-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Browse Books
          </button>
        </div>
      ) : (
        /* Books List */
        <div className="space-y-4">
          {borrowedBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {/* Book Cover */}
                <div className="md:w-48 h-48 md:h-auto bg-gradient-to-br from-orange-100 to-purple-100 flex-shrink-0">
                  {book.coverPage ? (
                    <img
                      src={book.coverPage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-orange-300" />
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {book.title}
                          </h3>
                          <p className="text-gray-600">by {book.author}</p>
                        </div>
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                          Borrowed
                        </span>
                      </div>

                      {/* Deposit Info */}
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-700">
                            <Coins className="h-4 w-4 mr-2 text-orange-500" />
                            <span className="font-semibold">
                              Deposit Amount:
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {(book["deposit-amount"] / 1000000).toFixed(2)}{" "}
                              STX{" "}
                            </p>
                            <p className="text-xs text-gray-500">
                              {book["deposit-amount"].toLocaleString()}{" "}
                              microSTX{" "}
                            </p>
                          </div>
                        </div>

                        {book.borrowedAt && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-700">
                              <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                              <span className="font-semibold">
                                Borrowed at Block:
                              </span>
                            </div>
                            <span className="font-mono text-gray-900">
                              {book.borrowedAt}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Return Button */}
                    <button
                      onClick={() => onReturn(book.id)}
                      disabled={!connected}
                      className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Unlock className="h-5 w-5 mr-2" />
                      Return Book & Get Deposit Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      {borrowedBooks.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Return books to get your deposit back
            instantly. Your deposit will be refunded in full when you return the
            book.
          </p>
        </div>
      )}
    </div>
  );
}
