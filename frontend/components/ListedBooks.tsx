"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Users,
  TrendingUp,
  Library,
  Pencil,
  Trash2,
} from "lucide-react";
import "@/styles/Dashboard.css";

interface Book {
  id: number;
  title: string;
  author: string;
  coverPage?: string;
  owner?: string;
  "is-available": boolean;
  "total-borrows": number;
  "deposit-amount": number;
}

interface DashboardProps {
  books: Book[];
  address: string | null;
  connected: boolean;
  onUpdate: (
    id: number,
    title: string,
    author: string,
    coverPage: string,
  ) => void;
  onDelete: (id: number) => void;
}

export default function Dashboard({
  books,
  address,
  connected,
  onUpdate,
  onDelete,
}: DashboardProps) {
  const myBooks = books.filter((b) => b.owner === address);
  const availableCount = myBooks.filter((b) => b["is-available"]).length;
  const onLoanCount = myBooks.filter((b) => !b["is-available"]).length;
  const totalBorrows = myBooks.reduce((sum, b) => sum + b["total-borrows"], 0);
  const totalDepositsLocked =
    myBooks
      .filter((b) => !b["is-available"])
      .reduce((sum, b) => sum + b["deposit-amount"], 0) / 1_000_000;
