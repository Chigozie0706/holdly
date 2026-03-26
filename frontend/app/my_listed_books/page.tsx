"use client";

import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import MyListedBooks from "@/components/MyListedBooks";
import { useStacks } from "@/providers/stacks-provider";
import { toast } from "sonner";

const CONTRACT_ADDRESS = "SP3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJB3SS99R";
const CONTRACT_NAME = "holdlyv8";
const DEPOSIT_AMOUNT = 1000000;

export default function MyListedBooksPage() {
  const { address, connected } = useStacks();
  const [books, setBooks] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAllBooks = async () => {
    try {
      const { fetchCallReadOnlyFunction, Cl, cvToJSON } =
        await import("@stacks/transactions");
      const { STACKS_TESTNET } = await import("@stacks/network");

      const bookCountResult = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-book-count",
        functionArgs: [],
        network: STACKS_TESTNET,
        senderAddress: CONTRACT_ADDRESS,
      });

      const totalBooks = Number(cvToJSON(bookCountResult).value.value);
      const fetchedBooks: any[] = [];

      for (let i = 1; i <= totalBooks; i++) {
        try {
          const bookResult = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "get-book",
            functionArgs: [Cl.uint(i)],
            network: STACKS_TESTNET,
            senderAddress: CONTRACT_ADDRESS,
          });

          const bookJson = cvToJSON(bookResult);
          if (bookJson.value) {
            const bookData = bookJson.value.value;
            fetchedBooks.push({
              id: i,
              title: bookData.title.value,
              author: bookData.author.value,
              coverPage: bookData["cover-page"].value,
              owner: bookData.owner.value,
              "is-available": bookData["is-available"].value,
              "total-borrows": Number(bookData["total-borrows"].value),
              "deposit-amount": Number(bookData["deposit-amount"].value),
            });
          }
        } catch (error) {
          console.error(`Error fetching book ${i}:`, error);
        }
      }
      setBooks(fetchedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const handleUpdateBook = async (
    id: number,
    title: string,
    author: string,
    coverPage: string,
  ) => {
    if (!connected) return;
    setIsProcessing(true);
    try {
      const { request } = await import("@stacks/connect");
      const { Cl } = await import("@stacks/transactions");
      const response = await request("stx_callContract", {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: "update-book",
        functionArgs: [
          Cl.uint(id),
          Cl.stringUtf8(title),
          Cl.stringUtf8(author),
          Cl.stringUtf8(coverPage || "https://via.placeholder.com/150"),
          Cl.uint(DEPOSIT_AMOUNT),
        ],
      });
      if (response.txid) {
        toast.success("Book updated!");
        setBooks((prev) =>
          prev.map((b) =>
            b.id === id ? { ...b, title, author, coverPage } : b,
          ),
        );
      }
    } catch (error) {
      toast.error(
        `Failed to update: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (!connected) return;
    const book = books.find((b) => b.id === id);
    if (!window.confirm(`Delete "${book?.title}"? This cannot be undone.`))
      return;
    setIsProcessing(true);
    try {
      const { request } = await import("@stacks/connect");
      const { Cl } = await import("@stacks/transactions");
      const response = await request("stx_callContract", {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: "delete-book",
        functionArgs: [Cl.uint(id)],
      });
      if (response.txid) {
        toast.success("Book deleted!");
        setBooks((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (error) {
      toast.error(
        `Failed to delete: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchAllBooks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isProcessing && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              Processing transaction... Please wait.
            </p>
          </div>
        )}

        <MyListedBooks
          books={books}
          address={address}
          connected={connected}
          onUpdate={handleUpdateBook}
          onDelete={handleDeleteBook}
        />
      </main>
      <Footer bookCount={books.length} />
    </div>
  );
}
