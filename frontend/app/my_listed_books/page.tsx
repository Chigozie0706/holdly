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
