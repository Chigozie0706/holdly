"use client";

import { useState, useEffect } from "react";
import Header from "@/components/HeaderWrapper";
import Footer from "@/components/Footer";
import { useStacks } from "@/providers/stacks-provider";
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

export default function BorrowHistoryPage() {}
