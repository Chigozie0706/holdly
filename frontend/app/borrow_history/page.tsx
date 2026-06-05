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
      const { readContract } = await import()

      const { STACKS_MAINNET } = await import("@stacks/network");

      //  Get total history count first
      const countResult = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-user-history-count",
        functionArgs: [Cl.principal(address)],
        network: STACKS_MAINNET,
        senderAddress: CONTRACT_ADDRESS,
      });

      const countJson = cvToJSON(countResult);
      console.log(
        "History count response:",
        JSON.stringify(countJson, null, 2),
      );

      //  Safe null check
      const totalEntries = countJson?.value?.value
        ? Number(countJson.value.value)
        : 0;

      setTotalBorrows(totalEntries);

      if (totalEntries === 0) {
        setHistory([]);
        setIsFetching(false);
        return;
      }

      //  Fetch each history item by index
      const historyPromises = Array.from({ length: totalEntries }, (_, i) =>
        fetchCallReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: "get-user-history-item",
          functionArgs: [Cl.principal(address), Cl.uint(i + 1)],
          network: STACKS_MAINNET,
          senderAddress: CONTRACT_ADDRESS,
        }).then((r) => cvToJSON(r)),
      );

      const historyResults = await Promise.all(historyPromises);
      console.log(
        "First history result:",
        JSON.stringify(historyResults[0], null, 2),
      );

      const enriched: (HistoryEntry | null)[] = await Promise.all(
        historyResults.map(async (result) => {
          // response → optional → tuple → actual data
          const entry = result?.value?.value?.value;
          if (!entry) return null;

          const bookId = Number(entry["book-id"]?.value);
          if (!bookId) return null;

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
            const alreadyRated =
              canRateJson.value?.value?.["already-rated"]?.value;
            if (alreadyRated) {
              setRatedBooks((prev) => new Set(prev).add(bookId));
            }

            return {
              bookId,
              title: bookData?.title?.value,
              author: bookData?.author?.value,
              coverPage: bookData?.["cover-page"]?.value,
              borrowedAt: Number(entry["borrowed-at"].value),
              returnedAt: Number(entry["returned-at"].value),
              depositAmount: Number(entry["deposit-amount"].value),
              depositToken: entry["deposit-token"].value,
            } as HistoryEntry;
          } catch {
            return {
              bookId,
              borrowedAt: Number(entry["borrowed-at"].value),
              returnedAt: Number(entry["returned-at"].value),
              depositAmount: Number(entry["deposit-amount"].value),
              depositToken: entry["deposit-token"].value,
            } as HistoryEntry;
          }
        }),
      );

      // Most recent first
      setHistory(
        enriched
          .filter((entry): entry is HistoryEntry => entry !== null)
          .reverse(),
      );
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
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    {/* Book */}
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        {entry.coverPage ? (
                          <img
                            src={entry.coverPage}
                            alt={entry.title}
                            style={{
                              width: "36px",
                              height: "48px",
                              objectFit: "cover",
                              borderRadius: "2px",
                            }}
                            onError={(e) =>
                              ((e.target as HTMLImageElement).style.display =
                                "none")
                            }
                          />
                        ) : (
                          <div
                            style={{
                              width: "36px",
                              height: "48px",
                              borderRadius: "2px",
                              background: "rgba(212,163,82,0.05)",
                              border: "1px solid rgba(212,163,82,0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <BookOpen size={14} color="rgba(212,163,82,0.3)" />
                          </div>
                        )}
                        <div>
                          <p
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 500,
                              color: "rgba(255,255,255,0.85)",
                              margin: "0 0 0.2rem",
                            }}
                          >
                            {entry.title || `Book #${entry.bookId}`}
                          </p>
                          <p
                            style={{
                              fontSize: "0.72rem",
                              color: "rgba(255,255,255,0.25)",
                              margin: 0,
                            }}
                          >
                            {entry.author
                              ? `by ${entry.author}`
                              : `ID #${entry.bookId}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Borrowed at */}
                    <td
                      style={{
                        padding: "0.85rem 1rem",
                        fontSize: "0.78rem",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      Block #{entry.borrowedAt}
                    </td>

                    {/* Returned at */}
                    <td
                      style={{
                        padding: "0.85rem 1rem",
                        fontSize: "0.78rem",
                        color: "rgba(74,222,128,0.7)",
                      }}
                    >
                      Block {entry.returnedAt.toLocaleString()}
                    </td>

                    {/* Deposit */}
                    <td
                      style={{
                        padding: "0.85rem 1rem",
                        fontSize: "0.82rem",
                        fontWeight: 500,
                        color: "#D4A352",
                      }}
                    >
                      {(entry.depositAmount / 1_000_000).toFixed(2)}{" "}
                      {entry.depositToken}
                    </td>

                    {/* Rate */}
                    <td style={{ padding: "0.85rem 1rem" }}>
                      {ratedBooks.has(entry.bookId) ? (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "rgba(255,255,255,0.2)",
                          }}
                        >
                          ★ Rated
                        </span>
                      ) : ratingBookId === entry.bookId ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setSelectedScore(star)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "1.1rem",
                                padding: "0.1rem",
                                color:
                                  star <= selectedScore
                                    ? "#D4A352"
                                    : "rgba(255,255,255,0.2)",
                                transition: "color 0.1s",
                              }}
                            >
                              ★
                            </button>
                          ))}
                          <button
                            onClick={() =>
                              handleRate(entry.bookId, selectedScore)
                            }
                            disabled={selectedScore === 0}
                            style={{
                              padding: "0.25rem 0.5rem",
                              fontSize: "0.7rem",
                              background: "rgba(212,163,82,0.1)",
                              border: "1px solid rgba(212,163,82,0.3)",
                              color:
                                selectedScore > 0
                                  ? "#D4A352"
                                  : "rgba(255,255,255,0.2)",
                              borderRadius: "2px",
                              cursor:
                                selectedScore > 0 ? "pointer" : "not-allowed",
                            }}
                          >
                            Submit
                          </button>
                          <button
                            onClick={() => {
                              setRatingBookId(null);
                              setSelectedScore(0);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              color: "rgba(255,255,255,0.3)",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setRatingBookId(entry.bookId);
                            setSelectedScore(0);
                          }}
                          style={{
                            padding: "0.3rem 0.6rem",
                            fontSize: "0.72rem",
                            background: "rgba(212,163,82,0.06)",
                            border: "1px solid rgba(212,163,82,0.2)",
                            color: "rgba(212,163,82,0.7)",
                            borderRadius: "2px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}
                        >
                          <Star size={11} /> Rate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer bookCount={0} />
    </div>
  );
}
