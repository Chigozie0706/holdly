# Holdly - Decentralized Book Lending Platform

[![Built on Stacks](https://img.shields.io/badge/Built%20on-Stacks-5546FF?logo=stacks)](https://www.stacks.co/)
[![Code4STX](https://img.shields.io/badge/Code4STX-Eligible-orange)](https://stacks.org/code4stx)
[![Clarinet](https://img.shields.io/badge/Clarinet-Passing-brightgreen)](https://github.com/hirosystems/clarinet)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Holdly is a decentralized peer-to-peer book lending marketplace built on Stacks. Book owners list their books with custom deposit amounts in STX or sBTC, and set their own borrow duration. Borrowers deposit collateral to borrow, which is automatically refunded on return. If a book is returned late, the deposit goes to the book owner. The platform is fully trustless — no intermediaries, no manual enforcement.

## 🚀 Live Demo

**Status**: 🟢 Live on Mainnet

**Live App**: [holdly-rho.vercel.app](https://holdly-rho.vercel.app/)

**Try it:**

1. Install [Leather Wallet](https://leather.io/) or [Xverse](https://www.xverse.app/)
2. Connect on mainnet
3. Browse books, donate a book, or borrow one

## Overview

Holdly allows users to:

- **Donate books** to the decentralized library with custom deposit amounts, tokens, and borrow durations
- **Borrow books** by depositing STX or sBTC as collateral
- **Return books** and automatically receive their deposit back
- **Rate books** after returning them (1–5 stars)
- **Track borrow history** with on-chain records
- **Manage listed books** — edit or delete books you own
- **Claim overdue deposits** as a book owner if a borrower doesn't return in time

## Features

✅ Custom deposit amounts per book (set by book owner)  
✅ Multi-token support — STX and sBTC deposits  
✅ Owner-set borrow duration (1–30 days)  
✅ Automatic deposit refund on return  
✅ Overdue penalty — deposit goes to owner if returned late  
✅ `claim-overdue` — owner can claim deposit if book is never returned  
✅ Book rating system (only returners can rate)  
✅ Scalable borrow history (no list size limit)  
✅ IPFS cover image storage via Pinata  
✅ CORS-safe API proxy for reliable data loading  
✅ Optimistic UI updates with on-chain polling  
✅ Responsive design with mobile drawer navigation

## Contract Details

- **Network**: Stacks Mainnet
- **Contract Address**: `SP3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJB3SS99R.holdlyv19`
- **Explorer**: [View on Stacks Explorer](https://explorer.hiro.so/address/SP3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJB3SS99R.holdlyv19?chain=mainnet)
- **Tokens**: STX (Native) + sBTC
- **Clarity Version**: 2
- **Status**: ✅ Deployed and Active

## Data Structures

### Books

```clarity
{
  title: (string-utf8 200),
  author: (string-utf8 100),
  cover-page: (string-utf8 200),
  owner: principal,
  is-available: bool,
  total-borrows: uint,
  deposit-amount: uint,
  deposit-token: (string-ascii 4),
  borrow-duration: uint,
}
```

### Borrows

```clarity
{
  borrower: principal,
  borrowed-at: uint,
  due-date: uint,
  deposit-amount: uint,
  deposit-token: (string-ascii 4),
}
```

### Borrow History

```clarity
{
  book-id: uint,
  borrowed-at: uint,
  returned-at: uint,
  deposit-amount: uint,
  deposit-token: (string-ascii 4),
  was-overdue: bool,
}
```

### Book Ratings

```clarity
{
  total-score: uint,
  count: uint,
}
```

## Smart Contract Functions

### Public

| Function        | Description                                                     |
| --------------- | --------------------------------------------------------------- |
| `add-book`      | List a book with deposit, token, and duration                   |
| `borrow-book`   | Borrow a book and lock collateral                               |
| `return-book`   | Return a book and receive deposit (or lose it if overdue)       |
| `claim-overdue` | Owner claims deposit if borrower didn't return in time          |
| `rate-book`     | Rate a book after returning (1–5, one rating per user per book) |
| `update-book`   | Edit your book's details (only when available)                  |
| `delete-book`   | Remove your book from the library (only when available)         |

### Read-Only

| Function                        | Description                                 |
| ------------------------------- | ------------------------------------------- |
| `get-book`                      | Get book details by ID                      |
| `get-borrow`                    | Get active borrow by book ID                |
| `get-book-count`                | Total books in the library                  |
| `is-book-available`             | Check availability                          |
| `get-book-rating`               | Get average rating and count                |
| `can-user-rate`                 | Check if user is eligible to rate           |
| `is-overdue`                    | Check if a borrow is past its due date      |
| `get-blocks-until-due`          | Blocks remaining before a borrow is overdue |
| `get-active-borrow-by-borrower` | Get a user's current borrow                 |
| `get-user-total-borrows`        | Lifetime borrow count for a user            |
| `get-user-history-count`        | Number of history entries for a user        |
| `get-user-history-item`         | Get a specific history entry by index       |
| `get-owner-book-count`          | Number of books listed by an owner          |
| `get-contract-stx-balance`      | STX balance held in contract                |

## 🛠️ Development Setup

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) v2.0+
- Node.js v18+ and npm
- Stacks wallet (Leather or Xverse)
- Pinata account (for IPFS image uploads)

### Smart Contract Development

```bash
git clone https://github.com/Chigozie0706/holdly
cd holdly

# Check contract validity
clarinet check

# Run tests
clarinet test
```

### Frontend Development

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
```

```bash
npm run dev
# Open http://localhost:3000
```

## Project Structure

holdly/

├── contracts/

│ └── holdlyv19.clar # Main lending contract

├── frontend/

│ ├── app/

│ │ ├── page.tsx # Root (redirects to /library)

│ │ ├── library/ # Browse all books

│ │ ├── donate_book/ # Add a book

│ │ ├── my_borrows/ # Active borrows

│ │ ├── my_listed_books/ # Books you own

│ │ ├── borrow_history/ # Return history + ratings

│ │ └── api/stacks/ # CORS proxy for Hiro API

│ ├── components/

│ │ ├── BookCard.tsx

│ │ ├── BrowseBooks.tsx

│ │ ├── AddBookForm.tsx

│ │ ├── MyBorrows.tsx

│ │ ├── MyListedBooks.tsx

│ │ ├── Header.tsx

│ │ └── HeaderWrapper.tsx

│ ├── lib/

│ │ ├── readContract.ts # Proxied contract reads

│ │ ├── pollTransaction.ts # On-chain polling

│ │ └── blockTime.ts # Block → time conversions

│ ├── providers/

│ │ └── stacks-provider.tsx

│ ├── config/

│ │ └── contract.ts # Contract address + name

│ └── styles/ # Per-component CSS files

├── Clarinet.toml

└── README.md

## 📈 Development Progress

### June 2026 ✅

- ✅ Mainnet deployment (holdlyv19)
- ✅ sBTC multi-token deposit support
- ✅ Owner-set borrow duration (1–30 days)
- ✅ Overdue system — late returns send deposit to owner
- ✅ `claim-overdue` function for unreturned books
- ✅ Book rating system (post-return only)
- ✅ Scalable borrow history with map-based indexing
- ✅ CORS proxy API route for reliable Hiro API access
- ✅ Optimistic UI with on-chain confirmation polling
- ✅ IPFS cover images via Pinata
- ✅ Page-router navigation (5 dedicated pages)
- ✅ Mobile-responsive header with hamburger drawer
- ✅ Sonner toast notifications replacing all alerts

### May 2026 ✅

- ✅ Migrated to mainnet
- ✅ Multi-page routing (library, borrows, listed books, history)
- ✅ Inline book editing from browse and dashboard views
- ✅ Delete book functionality
- ✅ Session persistence on wallet refresh

### April 2026 ✅

- ✅ Custom deposit amounts
- ✅ Borrow history tracking
- ✅ My Listed Books dashboard
- ✅ Post-condition handling for STX transfers

### Upcoming

- [ ] Block-to-date countdown timer in My Borrows
- [ ] Claim overdue UI for book owners
- [ ] Genre/category tags and filter
- [ ] Waitlist for borrowed books
- [ ] NFT integration for rare books

## Use Cases

1. **Community Libraries** — Neighborhoods can create decentralized book sharing
2. **Academic Institutions** — Students can lend textbooks with deposit protection
3. **Collectors** — Rare book owners can safely lend valuable items
4. **Book Clubs** — Members can share books with collateral assurance
5. **Christian Communities** — Faith-based libraries with trustless accountability

## Security

✅ Deposits held securely in smart contract  
✅ Only the borrower can return their own book  
✅ Only the book owner can claim overdue deposits  
✅ Only users who have returned a book can rate it  
✅ Post-condition checks on all STX transfers  
✅ Minimum deposit enforced on-chain (0.1 STX)  
✅ Borrow duration validated (1–30 days)  
✅ Immutable contract logic

## Technology Stack

### Smart Contract

- **Language**: Clarity v2
- **Blockchain**: Stacks (Bitcoin Layer 2)
- **Tokens**: STX + sBTC
- **Dev Tool**: Clarinet

### Frontend

- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript 5
- **Styling**: CSS Modules + Tailwind
- **Wallet**: @stacks/connect v8.2.4
- **SDK**: @stacks/transactions v7.3.1
- **Notifications**: Sonner
- **Images**: Pinata (IPFS)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Ensure `clarinet check` passes
4. Commit your changes (`git commit -m 'feat: add amazing feature'`)
5. Push and open a pull request

## License

MIT License — See [LICENSE](LICENSE) for details
