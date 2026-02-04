import React from "react";

interface FooterProps {
  bookCount: number;
}

export default function Footer({ bookCount }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm text-gray-500">
          <p>Built on Stacks • Secured by Bitcoin • Powered by sBTC</p>
          <p className="mt-2">Total Books: {bookCount}</p>
        </div>
      </div>
    </footer>
  );
}
