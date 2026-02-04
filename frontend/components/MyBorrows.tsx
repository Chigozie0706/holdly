import React from "react";
import { Unlock, BookOpen } from "lucide-react";

interface MyBorrowsProps {
  borrowedBooks: any[];
  onReturn: (id: number) => void;
}

export default function MyBorrows({ borrowedBooks, onReturn }: MyBorrowsProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          My Borrowed Books
        </h2>

        {borrowedBooks.length === 0 ? (
          <div className="text-center py-12">
            <Unlock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">You haven't borrowed any books yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {borrowedBooks.map((book) => (
              <div
                key={book.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <BookOpen className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600">by {book.author}</p>
                  </div>
                </div>
                <button
                  onClick={() => onReturn(book.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Return & Get Deposit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
