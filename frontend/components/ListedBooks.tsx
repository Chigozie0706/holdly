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
