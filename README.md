# Holdly - Decentralized Book Lending Platform

A Clarity smart contract that enables peer-to-peer book lending with STX collateral deposits on the Stacks blockchain.

## Overview

Holdly allows users to:

- **List books** with custom deposit amounts
- **Borrow books** by depositing STX as collateral
- **Return books** and automatically receive their deposit back
- **Track lending history** and book availability

## Features

✅ Custom deposit amounts per book (set by book owner)  
✅ Fully refundable STX deposits  
✅ Automatic deposit return on book return  
✅ Book ownership tracking  
✅ Borrow history and statistics  
✅ Native STX integration (no external token dependencies)

## Contract Details

- **Network**: Stacks Blockchain (Testnet)
- **Contract Address**: `ST3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJAGZBY3K.holdlyv6`
- **API Endpoint**: https://api.testnet.hiro.so
- **Token**: STX (Native Stacks Token)
- **Clarity Version**: 2
- **Epoch**: Latest
- **Status**: ✅ Deployed and Confirmed
- **Default Deposit**: 1 STX (1,000,000 microSTX)

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
  deposit-amount: uint
}
```

### Borrows

```clarity
{
  borrower: principal,
  borrowed-at: uint,
  deposit-amount: uint
}
```

## Smart Contract Functions

### Public Functions

#### `add-book`

```clarity
(add-book (title (string-utf8 200)) (author (string-utf8 100))
          (cover-page (string-utf8 200)) (deposit-amount uint))
```

Add a new book to the platform. Free to call - anyone can list books.

#### `borrow-book`

```clarity
(borrow-book (book-id uint))
```

Borrow an available book by depositing STX collateral.

#### `return-book`

```clarity
(return-book (book-id uint))
```

Return a borrowed book and automatically receive your STX deposit back.

### Read-Only Functions

- `get-book(book-id)` - Get book details
- `get-borrow(book-id)` - Get borrow information
- `get-book-count()` - Get total number of books
- `is-book-available(book-id)` - Check if book is available
- `get-book-deposit-amount(book-id)` - Get deposit amount for a book
- `get-contract-stx-balance()` - Get contract's STX balance

## Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) installed
- Node.js and npm (for frontend)
- Stacks wallet (Leather, Xverse, or Hiro)

## Installation

### Smart Contract

1. Clone the repository

```bash
git clone <repo-url>
cd holdly
```

2. Install Clarinet

```bash
brew install clarinet  # macOS
```

3. Deploy to testnet

```bash
clarinet deployments generate --testnet
clarinet deployments apply --testnet
```

### Frontend

1. Install dependencies

```bash
npm install
```

2. Run development server

```bash
npm run dev
```

3. Open http://localhost:3000

## Testnet Deployment ✅

The contract has been successfully deployed to Stacks Testnet:

**Deployed Contract:**

- Address: `ST3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJAGZBY3K.holdlyv6`
- Explorer: [View on Stacks Explorer](https://explorer.hiro.so/address/ST3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJAGZBY3K.holdlyv6?chain=testnet)

## Usage

### Adding a Book

1. Connect your Stacks wallet
2. Navigate to "Add Book" tab
3. Enter book details (title, author, cover URL)
4. Confirm transaction in wallet (free, only gas fees apply)

### Borrowing a Book

1. Browse available books
2. Click "Borrow Book"
3. Confirm STX deposit in wallet (default: 1 STX)
4. Wait for transaction confirmation
5. Book appears in "My Borrows" tab

### Returning a Book

1. Go to "My Borrows" tab
2. Click "Return Book & Get Deposit Back"
3. Confirm transaction in wallet
4. Receive automatic STX refund

## Use Cases

1. **Community Libraries** - Neighborhoods can create decentralized book sharing
2. **Academic Institutions** - Students can lend textbooks with deposit protection
3. **Collectors** - Rare book owners can safely lend valuable items
4. **Book Clubs** - Members can share books with collateral assurance

## Security Considerations

✅ **Security Features:**

- Deposits held securely in smart contract
- Only borrowers can return their own books
- Automatic refunds prevent human error
- Native STX transfers (no external token dependencies)
- Type-safe Clarity smart contract
- Post-condition checks for transaction safety

⚠️ **Important Notes:**

- Always verify contract address before transactions
- Test with small amounts first
- Book owners cannot withdraw deposits (automatic refund only)

## Technology Stack

### Smart Contract

- **Language**: Clarity
- **Blockchain**: Stacks
- **Token**: STX (Native)

### Frontend

- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Wallet Integration**: @stacks/connect
- **Blockchain SDK**: @stacks/transactions

## Roadmap

### Phase 1 (Current) ✅

- [x] Basic lending with STX deposits
- [x] Book listing and browsing
- [x] Borrow and return functionality
- [x] User borrowed books tracking

### Phase 2 (Planned)

- [ ] Multi-book borrowing
- [ ] Borrowing time limits
- [ ] Late fees mechanism
- [ ] Owner earnings from borrows
- [ ] Book rating system

### Phase 3 (Future)

- [ ] NFT integration for rare books
- [ ] Dispute resolution
- [ ] Multi-chain support
- [ ] Mobile app

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for new functionality
4. Commit your changes (`git commit -m 'feat: add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Submit a pull request

## Testing

### Smart Contract Tests

```bash
clarinet test
```

### Frontend Tests

```bash
npm test
```

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or contributions:

- Open an issue on GitHub
- Email: chigoziejacob@gmail.com
- Discord: [Stacks Discord](https://discord.gg/stacks)

## Acknowledgments

- Built on [Stacks blockchain](https://www.stacks.co/)
- Uses native STX for deposits
- Developed with [Clarinet](https://github.com/hirosystems/clarinet)
- Frontend powered by [Next.js](https://nextjs.org/)
- Wallet integration via [@stacks/connect](https://github.com/hirosystems/connect)

---

**Disclaimer:** This smart contract handles financial transactions. Always audit code before deploying to mainnet. Test thoroughly on testnet before production use.
