"use client";

import { useState, useEffect } from "react";
import Header from "@/components/HeaderWrapper";
import Footer from "@/components/Footer";
import { useStacks } from "@/providers/stacks-provider1";
import { CONTRACT_ADDRESS, CONTRACT_NAME } from "@/config/contract";
import { BookOpen, Star } from "lucide-react";
import { toast } from "sonner";

interface HistoryEntry {
  bookId: number;
  title?: string;
  coverPage?: string;
  author?: string;
  borrowedAt: number;
  returnedAt: number;
  depositAmount: number;
  depositToken: string;
}

export default function BorrowHistoryPage() {
  const { address, connected } = useStacks();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [totalBorrows, setTotalBorrows] = useState(0);
  const [isFetching, setIsFetching] = useState(true);

  //  Rating state
  const [ratingBookId, setRatingBookId] = useState<number | null>(null);
  const [selectedScore, setSelectedScore] = useState(0);
  const [ratedBooks, setRatedBooks] = useState<Set<number>>(new Set());

  const fetchHistory = async () => {
    if (!connected || !address) {
      setIsFetching(false);
      return;
    }

    try {
      setIsFetching(true);
      const { fetchCallReadOnlyFunction, Cl, cvToJSON } =
        await import("@stacks/transactions");

      const { STACKS_MAINNET } = await import("@stacks/network");

      // Fetch total borrows
      const totalResult = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-user-total-borrows",
        functionArgs: [Cl.principal(address)],
        network: STACKS_MAINNET,
        senderAddress: CONTRACT_ADDRESS,
      });

      setTotalBorrows(Number(cvToJSON(totalResult).value.value));

      // Fetch history list
      const historyResult = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-user-borrow-history",
        functionArgs: [Cl.principal(address)],
        network: STACKS_MAINNET,
        senderAddress: CONTRACT_ADDRESS,
      });

      const historyJson = cvToJSON(historyResult);
      const entries = historyJson.value.value as any[];

      // Enrich with book details and check rating eligibility

      const enriched: HistoryEntry[] = await Promise.all(
        entries.map(async (entry: any) => {
          const bookId = Number(entry.value["book-id"].value);
          try {
            const bookResult = await fetchCallReadOnlyFunction({
              contractAddress: CONTRACT_ADDRESS,
              contractName: CONTRACT_NAME,
              functionName: "get-book",
              functionArgs: [Cl.uint(bookId)],
              network: STACKS_MAINNET,
              senderAddress: CONTRACT_ADDRESS,
            });

            const bookJson = cvToJSON(bookResult);
            const bookData = bookJson.value?.value;

            const canRateResult = await fetchCallReadOnlyFunction({
              contractAddress: CONTRACT_ADDRESS,
              contractName: CONTRACT_NAME,
              functionName: "can-user-rate",
              functionArgs: [Cl.principal(address), Cl.uint(bookId)],
              network: STACKS_MAINNET,
              senderAddress: CONTRACT_ADDRESS,
            });

            const canRateJson = cvToJSON(canRateResult);
            const alreadyRated = canRateJson.value.value["already-rated"].value;
            if (alreadyRated) {
              setRatedBooks((prev) => new Set(prev).add(bookId));
            }
            return {
              bookId,
              title: bookData?.title?.value,
              author: bookData?.author?.value,
              coverPage: bookData?.["cover-page"]?.value,
              borrowedAt: Number(entry.value["borrowed-at"].value),
              returnedAt: Number(entry.value["returned-at"].value),
              depositAmount: Number(entry.value["deposit-amount"].value),
              depositToken: entry.value["deposit-token"].value,
            };
          } catch {
            return {
              bookId,
              borrowedAt: Number(entry.value["borrowed-at"].value),
              returnedAt: Number(entry.value["returned-at"].value),
              depositAmount: Number(entry.value["deposit-amount"].value),
              depositToken: entry.value["deposit-token"].value,
            };
          }
        }),
      );

      setHistory(enriched.reverse());
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleRate = async (bookId: number, score: number) => {
    if (!connected || score === 0) return;

    try {
      const { request } = await import("@stacks/connect");
      const { Cl } = await import("@stacks/transactions");
      const response = await request("stx_callContract", {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: "rate-book",
        functionArgs: [Cl.uint(bookId), Cl.uint(score)],
      });
      if (response.txid) {
        toast.success("Rating submitted!");
        setRatedBooks((prev) => new Set(prev).add(bookId));
        setRatingBookId(null);
        setSelectedScore(0);
      }
    } catch (error) {
      toast.error(
        `Failed to rate: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [connected, address]);

  if (!connected) {
    return (
      <div className="min-h-screen">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "5rem 2rem",
              gap: "0.85rem",
              border: "1px dashed rgba(255,255,255,0.07)",
              borderRadius: "4px",
            }}
          >
            <BookOpen size={28} color="rgba(212,163,82,0.3)" />
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                fontFamily: "serif",
                fontSize: "1.05rem",
              }}
            >
              {" "}
              Connect your wallet
            </p>

            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem" }}>
              {" "}
              Connect to view your borrow history
            </p>
          </div>
        </main>

        <Footer bookCount={0} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div style={{ marginBottom: "1.75rem" }}>
          <h2
            style={{
              fontFamily: "serif",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              margin: "0 0 0.25rem",
            }}
          >
            {" "}
            Borrow History
          </h2>

          <p
            style={{
              fontSize: "0.82rem",
              color: "rgba(255,255,255,0.3)",
              margin: 0,
            }}
          >
            {totalBorrows} book{totalBorrows !== 1 ? "s" : ""} borrowed in total
          </p>
        </div>

        {isFetching ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "5rem 2rem",
              gap: "0.85rem",
              border: "1px dashed rgba(255,255,255,0.07)",
              borderRadius: "4px",
            }}
          >
            <BookOpen size={28} color="rgba(212,163,82,0.3)" />
            <p style={{ color: "rgba(255,255,255,0.45)", fontFamily: "serif" }}>
              No history yet
            </p>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem" }}>
              Books you return will appear here
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {["Book", "Borrowed", "Returned", "Deposit", "Rate"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.85rem 1rem",
                          textAlign: "left",
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "rgba(255,255,255,0.22)",
                          fontWeight: 500,
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {history.map((entry, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {/* Book */}
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {entry.coverPage ? (
                          <img
                            src={entry.coverPage}
                            alt={entry.title}
                            style={{ width: "36px", height: "48px", objectFit: "cover", borderRadius: "2px" }}
                            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                          />
                        ):(
                                                    <div style={{
                            width: "36px", height: "48px", borderRadius: "2px",
                            background: "rgba(212,163,82,0.05)",
                            border: "1px solid rgba(212,163,82,0.1)",
                            display: "flex", alignItems: "center", justifyContent: "center"
                          }}>
                                                        <BookOpen size={14} color="rgba(212,163,82,0.3)" />

</div>
                        )}
                        <div>
                          <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "rgba(255,255,255,0.85)", margin: "0 0 0.2rem" }}>
                            {entry.title || `Book #${entry.bookId}`}
                          </p>
                          <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>
                            {entry.author ? `by ${entry.author}` : `ID #${entry.bookId}`}
                          </p>
                        </div>
                      </div>
                    </td>

                                        {/* Borrowed at */}
                    <td style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                      Block {entry.borrowedAt.toLocaleString()}
                    </td>


                    {/* Returned at */}
                    <td style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", color: "rgba(74,222,128,0.7)" }}>
                      Block {entry.returnedAt.toLocaleString()}
                    </td>


                    {/* Deposit */}
                    <td style={{ padding: "0.85rem 1rem", fontSize: "0.82rem", fontWeight: 500, color: "#D4A352" }}>
                      {(entry.depositAmount / 1_000_000).toFixed(2)} {entry.depositToken}
                    </td>

                        )
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
