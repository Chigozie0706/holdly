"use client";

import AddBookForm from "@/components/AddBookForm";
import { useStacks } from "@/providers/stacks-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DEPOSIT_AMOUNT,
  CONTRACT_ADDRESS,
  CONTRACT_NAME,
} from "@/config/contract";

export default function DonateBook() {
  const { connected } = useStacks();
  const router = useRouter();

  const handleAddBook = async (
    title: string,
    author: string,
    coverPage: string,
    depositAmount: number,
    depositToken: "STX" | "sBTC",
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
          Cl.uint(depositAmount),
          Cl.stringAscii(depositToken),
        ],
      });

      if (response.txid) {
        toast.success("Book added successfully!");
        router.push("/");
      }
    } catch (error) {
      toast.error(
        `Failed to add book: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return <AddBookForm onAdd={handleAddBook} />;
}
