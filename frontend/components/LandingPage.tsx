"use client";

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@200;300;400;500&display=swap');

        .lp { font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

        /* Ambient glows */
        .glow { position: fixed; border-radius: 50%; filter: blur(130px); pointer-events: none; z-index: 0; }
        .glow-1 { width: 700px; height: 700px; background: radial-gradient(circle, rgba(212,163,82,0.07) 0%, transparent 70%); top: -200px; left: -200px; }
        .glow-2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(80,60,160,0.06) 0%, transparent 70%); bottom: 0; right: -150px; }
        .glow-3 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(212,163,82,0.04) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%,-50%); }

        /* ── Hero ── */
        .lp-hero {
          position: relative;
          z-index: 1;
          min-height: calc(100vh - 64px); /* account for sticky header */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem 4rem;
          text-align: center;
          overflow: hidden;
        }
        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(212,163,82,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,163,82,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 55% at 50% 50%, black 20%, transparent 100%);
        }
        .hero-rule {
          position: absolute; height: 1px; width: 55%; left: 22.5%;
          background: linear-gradient(90deg, transparent, rgba(212,163,82,0.3), transparent);
        }
        .hero-rule-t { top: 0; }
        .hero-rule-b { bottom: 40px; }

        .lp-eyebrow {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.28rem 0.85rem;
          background: rgba(212,163,82,0.07);
          border: 1px solid rgba(212,163,82,0.2);
          border-radius: 2px;
          font-size: 0.68rem; letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(212,163,82,0.8);
          margin-bottom: 1.75rem;
          opacity: 0; transform: translateY(10px);
          transition: opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s;
        }
        .lp-eyebrow.in { opacity: 1; transform: translateY(0); }
        .eyebrow-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #D4A352;
          animation: blink 2.5s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .lp-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 8.5vw, 7rem);
          font-weight: 900; line-height: 1.0; letter-spacing: -0.025em;
          color: rgba(255,255,255,0.95); margin: 0 0 0.1em;
          opacity: 0; transform: translateY(18px);
          transition: opacity 0.75s ease 0.2s, transform 0.75s ease 0.2s;
        }
        .lp-h1.in { opacity: 1; transform: translateY(0); }
        .lp-h1 .italic-gold {
          font-style: italic;
          background: linear-gradient(135deg, #D4A352 0%, #F0C878 40%, #D4A352 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .lp-tagline {
          max-width: 500px;
          font-size: 1rem; font-weight: 300; color: rgba(255,255,255,0.32);
          line-height: 1.7; margin: 1.25rem auto 2.5rem;
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.65s ease 0.38s, transform 0.65s ease 0.38s;
        }
        .lp-tagline.in { opacity: 1; transform: translateY(0); }

        .hero-ctas {
          display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap;
          margin-bottom: 3.5rem;
          opacity: 0; transform: translateY(12px);
          transition: opacity 0.6s ease 0.52s, transform 0.6s ease 0.52s;
        }
        .hero-ctas.in { opacity: 1; transform: translateY(0); }

        .cta-main {
          display: inline-flex; align-items: center; gap: 0.55rem;
          padding: 0.85rem 1.9rem;
          background: linear-gradient(135deg, #D4A352, #C8903A);
          border: none; border-radius: 2px;
          color: #080810;
          font-family: 'DM Sans', sans-serif; font-size: 0.92rem; font-weight: 600;
          letter-spacing: 0.03em; cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s;
          position: relative; overflow: hidden;
        }
        .cta-main::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent);
          opacity: 0; transition: opacity 0.18s;
        }
        .cta-main:hover::before { opacity: 1; }
        .cta-main:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(212,163,82,0.3); }

        .cta-ghost {
          display: inline-flex; align-items: center; gap: 0.55rem;
          padding: 0.85rem 1.65rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1); border-radius: 2px;
          color: rgba(255,255,255,0.42);
          font-family: 'DM Sans', sans-serif; font-size: 0.92rem;
          cursor: pointer; transition: border-color 0.18s, color 0.18s;
        }
        .cta-ghost:hover { border-color: rgba(212,163,82,0.35); color: rgba(212,163,82,0.8); }

        .scroll-cue {
          display: flex; flex-direction: column; align-items: center; gap: 0.35rem;
          color: rgba(255,255,255,0.12); font-size: 0.68rem;
          letter-spacing: 0.14em; text-transform: uppercase;
          cursor: pointer; background: none; border: none;
          opacity: 0;
          transition: opacity 0.6s ease 0.85s, color 0.18s;
        }
        .scroll-cue.in { opacity: 1; }
        .scroll-cue:hover { color: rgba(212,163,82,0.45); }
        .bounce { animation: bounce 2.2s ease-in-out infinite; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }

        /* ── Stats band ── */
        .lp-stats {
          position: relative; z-index: 1;
          border-top: 1px solid rgba(212,163,82,0.08);
          border-bottom: 1px solid rgba(212,163,82,0.08);
          background: rgba(212,163,82,0.02);
          padding: 2.25rem 2rem;
        }
        .stats-row {
          max-width: 720px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 1rem; text-align: center;
        }
        .stat-n {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem; font-weight: 700; color: #D4A352;
          display: block; line-height: 1;
        }
        .stat-l {
          font-size: 0.68rem; text-transform: uppercase;
          letter-spacing: 0.12em; color: rgba(255,255,255,0.22);
          margin-top: 0.4rem; display: block;
        }

        /* ── Shared section styles ── */
        .lp-section {
          position: relative; z-index: 1;
          max-width: 1080px; margin: 0 auto;
          padding: 6rem 2rem;
        }
        .sec-eyebrow {
          font-size: 0.68rem; text-transform: uppercase;
          letter-spacing: 0.18em; color: rgba(212,163,82,0.55);
          margin: 0 0 0.7rem;
          display: flex; align-items: center; gap: 0.6rem;
        }
        .sec-eyebrow::after {
          content: ''; flex: 1; max-width: 52px; height: 1px;
          background: linear-gradient(90deg, rgba(212,163,82,0.28), transparent);
        }
        .sec-h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 700; color: rgba(255,255,255,0.9);
          margin: 0 0 0.85rem; line-height: 1.15;
        }
        .sec-sub {
          font-size: 0.88rem; color: rgba(255,255,255,0.28);
          max-width: 420px; line-height: 1.65; margin: 0 0 2.75rem;
        }

        /* ── Steps grid ── */
        .steps-grid {
          display: grid; grid-template-columns: repeat(auto-fit,minmax(210px,1fr));
          gap: 1px;
          background: rgba(212,163,82,0.06);
          border: 1px solid rgba(212,163,82,0.09);
          border-radius: 4px; overflow: hidden;
        }
        .step { background: #0a0a14; padding: 1.85rem 1.6rem; transition: background 0.18s; }
        .step:hover { background: rgba(212,163,82,0.025); }
        .step-num {
          font-family: 'Playfair Display', serif;
          font-size: 2.75rem; font-weight: 700;
          color: rgba(212,163,82,0.1); line-height: 1; margin: 0 0 0.85rem;
        }
        .step-ico {
          width: 38px; height: 38px;
          background: rgba(212,163,82,0.07);
          border: 1px solid rgba(212,163,82,0.18); border-radius: 2px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.9rem;
        }
        .step-t {
          font-family: 'Playfair Display', serif;
          font-size: 1rem; font-weight: 600;
          color: rgba(255,255,255,0.85); margin: 0 0 0.45rem;
        }
        .step-d { font-size: 0.78rem; color: rgba(255,255,255,0.27); line-height: 1.6; margin: 0; }

        /* ── Features grid ── */
        .feat-grid {
          display: grid; grid-template-columns: repeat(auto-fit,minmax(290px,1fr));
          gap: 1px;
          background: rgba(255,255,255,0.038);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 4px; overflow: hidden;
        }
        .feat { background: #0a0a14; padding: 1.85rem 1.75rem; transition: background 0.18s; }
        .feat:hover { background: rgba(212,163,82,0.02); }
        .feat-ico {
          width: 42px; height: 42px;
          background: rgba(212,163,82,0.06);
          border: 1px solid rgba(212,163,82,0.15); border-radius: 2px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1rem;
        }
        .feat-t {
          font-family: 'Playfair Display', serif;
          font-size: 0.98rem; font-weight: 600;
          color: rgba(255,255,255,0.85); margin: 0 0 0.4rem;
        }
        .feat-d { font-size: 0.78rem; color: rgba(255,255,255,0.26); line-height: 1.6; margin: 0; }

        /* ── Final CTA ── */
        .lp-cta {
          position: relative; z-index: 1;
          padding: 7rem 2rem; text-align: center; overflow: hidden;
        }
        .lp-cta-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(212,163,82,0.045) 0%, transparent 70%);
        }
        .lp-cta-line {
          position: absolute; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,163,82,0.26), transparent);
        }
        .lp-cta-line-t { top: 0; }
        .lp-cta-line-b { bottom: 0; }
        .lp-cta-body { position: relative; z-index: 1; max-width: 540px; margin: 0 auto; }
        .lp-cta-h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 5.5vw, 3.5rem);
          font-weight: 700; color: rgba(255,255,255,0.9);
          margin: 0 0 0.9rem; line-height: 1.1;
        }
        .lp-cta-h2 i { font-style: italic; color: #D4A352; }
        .lp-cta-p { font-size: 0.88rem; color: rgba(255,255,255,0.27); line-height: 1.65; margin: 0 0 2.25rem; }
        .cta-row { display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap; }

        @media (max-width: 580px) {
          .stats-row { grid-template-columns: 1fr; }
          .lp-h1 { font-size: clamp(2.5rem, 11vw, 4rem); }
        }
      `}</style>

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
