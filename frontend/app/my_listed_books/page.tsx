"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
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
}
