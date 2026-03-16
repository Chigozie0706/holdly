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
