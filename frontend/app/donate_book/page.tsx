"use client";

import AddBookForm from "@/components/AddBookForm";
import { useStacks } from "@/providers/stacks-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const DEPOSIT_AMOUNT = 1000000;
const CONTRACT_ADDRESS = "SP3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJB3SS99R";
const CONTRACT_NAME = "holdlyv8";

export default function DonateBook() {
  const { connected } = useStacks();
  const router = useRouter();

  const handleAddBook = async (
    title: string,
    author: string,
    coverPage: string,
  ) => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const { request } = await import("@stacks/connect");
      const { Cl } = await import("@stacks/transactions");

      const response = await request("stx_callContract", {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: "add-book",
        functionArgs: [
          Cl.stringUtf8(title),
          Cl.stringUtf8(author),
          Cl.stringUtf8(coverPage || "https://via.placeholder.com/150"),
          Cl.uint(DEPOSIT_AMOUNT),
        ],
      });

      if (response.txid) {
        toast.success(`Book added successfully! TX: ${response.txid}`);
        router.push("/library");
      }
    } catch (error) {
      toast.error(
        `Failed to add book: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return <AddBookForm onAdd={handleAddBook} />;
}
