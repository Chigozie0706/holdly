"use client";

import "@/styles/Header.css";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  LogOut,
  BookMarked,
  Library,
  PlusCircle,
  BookOpen,
} from "lucide-react";

interface HeaderProps {
  connected: boolean;
  address: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

const NAV_LINKS = [
  { href: "/library", label: "Library", icon: Library },
  { href: "/donate_book", label: "Donate Book", icon: PlusCircle },
  { href: "/my_borrows", label: "My Borrows", icon: BookOpen },
];

export default function Header({
  connected,
  address,
  onConnect,
  onDisconnect,
}: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const truncate = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  return (
    <>
      {/* ── Header bar ── */}
      <header className={`hdr ${scrolled ? "scrolled" : ""}`}>
        <div className="hdr-inner">
          {/* Brand */}
          <Link href="/" className="hdr-brand">
            <div className="hdr-brand-icon">
              <BookMarked size={16} color="rgba(212,163,82,0.8)" />
            </div>
            <div>
              <span className="hdr-wordmark">Holdly</span>
              <span className="hdr-tagline">Decentralized Library</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hdr-nav">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`hdr-nav-link ${pathname === href ? "active" : ""}`}
              >
                <Icon size={14} className="hdr-nav-icon" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Wallet */}
          <div className="hdr-wallet">
            {connected && address ? (
              <>
                <div className="wallet-addr">
                  <span className="wallet-dot" />
                  {truncate(address)}
                </div>
                <button className="btn-disconnect" onClick={onDisconnect}>
                  <LogOut size={12} />
                  Disconnect
                </button>
              </>
            ) : (
              <button className="btn-connect" onClick={onConnect}>
                <Wallet size={14} />
                Connect Wallet
              </button>
            )}

            {/* Hamburger */}
            <button
              className={`hdr-hamburger ${mobileOpen ? "open" : ""}`}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <div className={`hdr-drawer ${mobileOpen ? "open" : ""}`}>
        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`drawer-link ${pathname === href ? "active" : ""}`}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}

        <div className="drawer-sep" />

        {connected && address ? (
          <button
            className="btn-disconnect drawer-wallet-btn"
            onClick={onDisconnect}
          >
            <LogOut size={13} />
            Disconnect wallet
          </button>
        ) : (
          <button className="btn-connect drawer-wallet-btn" onClick={onConnect}>
            <Wallet size={14} />
            Connect Wallet
          </button>
        )}
      </div>
    </>
  );
}
