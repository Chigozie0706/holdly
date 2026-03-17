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
  if (!connected) {
    return (
      <div className="dash-empty">
        <div className="dash-empty-icon">
          <Library size={28} color="rgba(212,163,82,0.3)" />
        </div>
        <p className="dash-empty-title">Connect your wallet</p>
        <p className="dash-empty-sub">Connect to view your dashboard</p>
      </div>
    );
  }

  if (myBooks.length === 0) {
    return (
      <div className="dash-empty">
        <div className="dash-empty-icon">
          <BookOpen size={28} color="rgba(212,163,82,0.3)" />
        </div>
        <p className="dash-empty-title">No books listed yet</p>
        <p className="dash-empty-sub">
          Books you add to the library will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="dash-wrap">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h2 className="dash-title">My Dashboard</h2>
          <p className="dash-sub">Books you've added to the library</p>
        </div>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        <div className="dash-stat-card">
          <Library size={18} color="#D4A352" />
          <span className="dash-stat-num">{myBooks.length}</span>
          <span className="dash-stat-lbl">Total Listed</span>
        </div>
        <div className="dash-stat-card">
          <BookOpen size={18} color="#4ade80" />
          <span className="dash-stat-num">{availableCount}</span>
          <span className="dash-stat-lbl">Available</span>
        </div>
        <div className="dash-stat-card">
          <Users size={18} color="#f87171" />
          <span className="dash-stat-num">{onLoanCount}</span>
          <span className="dash-stat-lbl">On Loan</span>
        </div>
        <div className="dash-stat-card">
          <TrendingUp size={18} color="#a78bfa" />
          <span className="dash-stat-num">{totalBorrows}</span>
          <span className="dash-stat-lbl">Total Borrows</span>
        </div>
      </div>

{totalDepositsLocked > 0 && (
        <div className="dash-deposits-notice">
          <span className="dash-deposits-label">STX currently locked in deposits</span>
          <span className="dash-deposits-value">{totalDepositsLocked.toFixed(2)} STX</span>
        </div>
      )}

      {/* Book list */}
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Status</th>
              <th>Deposit</th>
              <th>Borrows</th>
              <th>Actions</th>
            </tr>
          </thead>
