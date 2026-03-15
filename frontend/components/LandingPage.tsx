"use client";

import "@/styles/LandingPage.css";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Lock,
  RotateCcw,
  Globe,
  ChevronDown,
  Coins,
  Shield,
  Zap,
  BookMarked,
} from "lucide-react";
import { useStacks } from "@/providers/stacks-provider";

export default function LandingPage() {
  const router = useRouter();
  const { connectWallet } = useStacks();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const goToLibrary = () => router.push("/library");
  const handleConnect = async () => {
    await connectWallet();
    router.push("/library");
  };

  return (
    <>
      <div className="lp">
        {/* Glows */}
        <div className="glow glow-1" />
        <div className="glow glow-2" />
        <div className="glow glow-3" />

        {/* ── Hero ── */}
        <section className="lp-hero">
          <div className="hero-grid" />
          <div className="hero-rule hero-rule-t" />

          <span className={`lp-eyebrow ${mounted ? "in" : ""}`}>
            <span className="eyebrow-dot" />
            Built on Stacks · Secured by Bitcoin
          </span>

          <h1 className={`lp-h1 ${mounted ? "in" : ""}`}>
            The <span className="italic-gold">decentralized</span>
            <br />
            lending library
          </h1>

          <p className={`lp-tagline ${mounted ? "in" : ""}`}>
            Lend and borrow books with trustless STX deposits. No middlemen. No
            late fees. Just Bitcoin-secured collateral that returns the moment
            you return the book.
          </p>

          <div className={`hero-ctas ${mounted ? "in" : ""}`}>
            <button className="cta-main" onClick={goToLibrary}>
              Enter Library <ArrowRight size={15} />
            </button>
            <button className="cta-ghost" onClick={handleConnect}>
              Connect Wallet
            </button>
          </div>

          <button
            className={`scroll-cue ${mounted ? "in" : ""}`}
            onClick={() =>
              document
                .getElementById("hiw")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <span>Scroll to explore</span>
            <ChevronDown size={13} className="bounce" />
          </button>

          <div className="hero-rule hero-rule-b" />
        </section>

        {/* ── Stats ── */}
        <div className="lp-stats">
          <div className="stats-row">
            <div>
              <span className="stat-n">0%</span>
              <span className="stat-l">Platform fee</span>
            </div>
            <div>
              <span className="stat-n">100%</span>
              <span className="stat-l">Deposit returned</span>
            </div>
            <div>
              <span className="stat-n">∞</span>
              <span className="stat-l">Books possible</span>
            </div>
          </div>
        </div>

        {/* ── How it works ── */}
        <section id="hiw" className="lp-section">
          <p className="sec-eyebrow">How it works</p>
          <h2 className="sec-h2">
            Simple as a library card.
            <br />
            Trustless as Bitcoin.
          </h2>
          <p className="sec-sub">
            Every transaction is on Stacks. Your deposit lives in the smart
            contract — not with us.
          </p>

          <div className="steps-grid">
            {[
              {
                n: "01",
                ico: <Globe size={17} color="rgba(212,163,82,0.7)" />,
                t: "Connect your wallet",
                d: "Use any Stacks-compatible wallet. Your address is your identity — no accounts, no passwords.",
              },
              {
                n: "02",
                ico: <BookMarked size={17} color="rgba(212,163,82,0.7)" />,
                t: "Browse the collection",
                d: "Explore books added by the community. Each listing shows the title, author, and required deposit.",
              },
              {
                n: "03",
                ico: <Coins size={17} color="rgba(212,163,82,0.7)" />,
                t: "Deposit & borrow",
                d: "Lock a small STX deposit into the smart contract. The contract holds it — no one else can touch it.",
              },
              {
                n: "04",
                ico: <RotateCcw size={17} color="rgba(212,163,82,0.7)" />,
                t: "Return & reclaim",
                d: "Return the book and call the contract. Your deposit is sent back to your wallet instantly.",
              },
            ].map(({ n, ico, t, d }) => (
              <div key={n} className="step">
                <div className="step-num">{n}</div>
                <div className="step-ico">{ico}</div>
                <h3 className="step-t">{t}</h3>
                <p className="step-d">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section className="lp-section" style={{ paddingTop: 0 }}>
          <p className="sec-eyebrow">Why Holdly</p>
          <h2 className="sec-h2">Built different.</h2>
          <p className="sec-sub">Everything you need. Nothing you don't.</p>

          <div className="feat-grid">
            {[
              {
                ico: <Shield size={19} color="rgba(212,163,82,0.7)" />,
                t: "Non-custodial",
                d: "Your deposits are held by the smart contract, not by Holdly. We have zero access to your funds.",
              },
              {
                ico: <Zap size={19} color="rgba(212,163,82,0.7)" />,
                t: "Instant refunds",
                d: "Smart contract logic triggers the deposit return the moment your return transaction confirms.",
              },
              {
                ico: <Globe size={19} color="rgba(212,163,82,0.7)" />,
                t: "Open to anyone",
                d: "No approval process. Anyone with a Stacks wallet can lend books or borrow from the community.",
              },
              {
                ico: <BookMarked size={19} color="rgba(212,163,82,0.7)" />,
                t: "IPFS cover images",
                d: "Book covers are pinned to IPFS via Pinata, ensuring they persist as long as the contract does.",
              },
              {
                ico: <Lock size={19} color="rgba(212,163,82,0.7)" />,
                t: "Bitcoin-anchored",
                d: "All state lives on Stacks, which settles to Bitcoin. Every borrow is as durable as the blockchain.",
              },
              {
                ico: <Coins size={19} color="rgba(212,163,82,0.7)" />,
                t: "Flexible deposits",
                d: "Book owners set the deposit amount they're comfortable with when listing their book.",
              },
            ].map(({ ico, t, d }) => (
              <div key={t} className="feat">
                <div className="feat-ico">{ico}</div>
                <h3 className="feat-t">{t}</h3>
                <p className="feat-d">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="lp-cta">
          <div className="lp-cta-glow" />
          <div className="lp-cta-line lp-cta-line-t" />
          <div className="lp-cta-line lp-cta-line-b" />
          <div className="lp-cta-body">
            <h2 className="lp-cta-h2">
              Ready to <i>borrow</i>?
            </h2>
            <p className="lp-cta-p">
              Join the decentralized library. Borrow books with trustless
              collateral. Every deposit returned. Every transaction on-chain.
            </p>
            <div className="cta-row">
              <button className="cta-main" onClick={goToLibrary}>
                Browse Library <ArrowRight size={15} />
              </button>
              <button className="cta-ghost" onClick={handleConnect}>
                Connect Wallet
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
