# Holdly - Decentralized Book Lending Platform

[![Built on Stacks](https://img.shields.io/badge/Built%20on-Stacks-5546FF?logo=stacks)](https://www.stacks.co/)
[![Code4STX](https://img.shields.io/badge/Code4STX-Eligible-orange)](https://stacks.org/code4stx)
[![Clarinet](https://img.shields.io/badge/Clarinet-Passing-brightgreen)](https://github.com/hirosystems/clarinet)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Holdly is a decentralized peer-to-peer christian book rental marketplace built on Stacks where lenders set rental prices in STX and earn when others borrow their books. Borrowers pay the rental fee upfront in STX, and if they return the book within the specified timeframe, they receive a full or partial refund; if they fail to return on time, the lender automatically keeps the payment as compensation. The platform serves book owners who want to monetize their collections through trustless rentals, and readers who want temporary access to books with clear financial incentives to return them promptly.

## 🏆 Code4STX Eligible

This project is participating in [Code4STX](https://stacks.org/code4stx), a monthly program rewarding developers building on Bitcoin via Stacks. Building on Bitcoin through Stacks provides unmatched security, a $1T+ market cap ecosystem, and battle-tested longevity.

## 🚀 Live Demo

**Status**: 🟡 Active Development → Public Beta

**Testnet Deployment**: [Demo Link](https://holdly-rho.vercel.app/)

**Try it locally:**

1. Install [Leather Wallet](https://leather.io/)
2. Switch to Stacks Testnet
3. Get testnet STX from [Hiro Faucet](https://platform.hiro.so/faucet)
4. Clone and run the project (see [Development Setup](#development-setup))

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

## 📸 Demo

### Browse Books Interface

_Users can browse available books and see deposit requirements_

### Borrow Flow

_Simple one-click borrowing with STX collateral_

### My Borrows Dashboard

_Track all borrowed books and manage returns_

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

## 🛠️ Development Setup

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) v2.0+
- Node.js v18+ and npm
- Stacks wallet (Leather, Xverse, or Hiro)

### Smart Contract Development

1. **Clone the repository**

```bash
git clone https://github.com/Chigozie0706/holdly
cd holdly
```

2. **Install Clarinet**

```bash
brew install clarinet  # macOS
# For other OS: https://docs.hiro.so/clarinet
```

3. **Check contract validity**

```bash
clarinet check
```

4. **Run tests**

```bash
clarinet test
```

5. **Deploy to testnet**

```bash
clarinet deployments generate --testnet
clarinet deployments apply --testnet
```

### Frontend Development

1. **Install dependencies**

```bash
cd holdly
pnpm install
```

3. **Run development server**

```bash
pnpm run dev
```

4. **Open browser**

Navigate to http://localhost:3000

5. **Build for production**

```bash
pnpm run build
pnpm start
```

## 🧪 Testing

### Smart Contract Tests

```bash
# Run all tests
clarinet test

# Check contract validity
clarinet check

# Run specific test file
clarinet test tests/holdly_test.ts
```

**Test Coverage:**

- ✅ Book addition with validation
- ✅ Borrow with correct STX deposit
- ✅ Return with automatic refund
- ✅ Error handling (invalid book ID, insufficient funds)
- ✅ Access control (only borrower can return their book)
- ✅ Multiple concurrent borrows

### Frontend Tests

```bash
npm test
```

**Component Tests:**

- ✅ Wallet connection flow
- ✅ Book listing and search
- ✅ Borrow transaction handling
- ✅ Return transaction handling
- ✅ Error state management

## 📚 Stacks Integration

This project leverages the following Stacks libraries and meets all Code4STX requirements:

### Stacks Libraries Used

- **@stacks/connect** (^8.2.4) - Wallet connection and authentication
- **@stacks/transactions** (^7.3.1) - Transaction construction and signing
- **@stacks/network** (^7.3.1) - Network configuration (testnet/mainnet)
- **Clarity** - Smart contract language for secure on-chain logic

### Validation

- ✅ All smart contracts written in Clarity
- ✅ Passes `clarinet check` validation
- ✅ Open-source and publicly available
- ✅ Uses native STX (no external dependencies)

<!-- ## 📁 Project Structure
```
holdly/
├── contracts/
│   ├── holdlyv6.clar           # Main lending contract (Clarity)
│   └── tests/
│       └── holdly_test.ts      # Contract test suite
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Main app logic & state
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── BrowseBooks.tsx     # Book listing interface
│   │   ├── AddBookForm.tsx     # Add book form
│   │   ├── MyBorrows.tsx       # User borrows dashboard
│   │   ├── Header.tsx          # Wallet connection
│   │   ├── TabNavigation.tsx   # Tab switcher
│   │   └── Footer.tsx          # App footer
│   └── providers/
│       └── stacks-provider.tsx # Wallet state management
├── Clarinet.toml               # Clarinet configuration
├── package.json                # Dependencies
└── README.md                   # This file
``` -->

## 📈 Development Progress

### February 2026 ✅

- ✅ Migrated from sBTC to native STX deposits
- ✅ Implemented automatic refund mechanism
- ✅ Added "My Borrows" tracking interface
- ✅ Fixed post-condition handling for STX transfers
- ✅ Deployed v6 contract to testnet
- ✅ Added comprehensive error handling

### January 2026 ✅

- ✅ Initial smart contract development (Clarity)
- ✅ Frontend integration with Stacks wallets
- ✅ Book listing and browsing UI
- ✅ Basic borrow/return functionality
- ✅ Testnet deployment

### Upcoming (March 2026)

- [ ] Multi-book borrowing support
- [ ] Time-based lending limits
- [ ] Enhanced mobile responsiveness
- [ ] Contract test suite expansion
- [ ] Mainnet deployment preparation
- [ ] User analytics dashboard

## Testnet Deployment ✅

The contract has been successfully deployed to Stacks Testnet:

**Deployed Contract:**

- Address: `ST3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJAGZBY3K.holdlyv6`
- Explorer: [View on Stacks Explorer](https://explorer.hiro.so/address/ST3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJAGZBY3K.holdlyv6?chain=testnet)
- Verified: ✅ Passes clarinet check
- Status: Active

## Usage

### Adding a Book

1. Connect your Stacks wallet
2. Navigate to "Add Book" tab
3. Enter book details (title, author, cover URL)
4. Set custom deposit amount (default: 1 STX)
5. Confirm transaction in wallet (free, only gas fees apply)

### Borrowing a Book

1. Browse available books
2. Click "Borrow Book"
3. Review deposit amount
4. Confirm STX deposit in wallet
5. Wait for transaction confirmation (~30 seconds)
6. Book appears in "My Borrows" tab

### Returning a Book

1. Go to "My Borrows" tab
2. Find your borrowed book
3. Click "Return Book & Get Deposit Back"
4. Confirm transaction in wallet
5. Receive automatic STX refund

## Use Cases

1. **Community Libraries** - Neighborhoods can create decentralized book sharing
2. **Academic Institutions** - Students can lend textbooks with deposit protection
3. **Collectors** - Rare book owners can safely lend valuable items
4. **Book Clubs** - Members can share books with collateral assurance
5. **Co-working Spaces** - Shared resource libraries with automatic accountability

## Security Considerations

✅ **Security Features:**

- Deposits held securely in smart contract
- Only borrowers can return their own books
- Automatic refunds prevent human error
- Native STX transfers (no external token dependencies)
- Type-safe Clarity smart contract
- Post-condition checks for transaction safety
- Immutable contract logic

⚠️ **Important Notes:**

- Always verify contract address before transactions
- Test with small amounts first
- Book owners cannot withdraw deposits (automatic refund only)
- Testnet tokens have no real value

## Technology Stack

### Smart Contract

- **Language**: Clarity v2
- **Blockchain**: Stacks
- **Token**: STX (Native)
- **Development**: Clarinet
- **Network**: Testnet (Mainnet coming soon)

### Frontend

- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS
- **Wallet Integration**: @stacks/connect v7.8.2
- **Blockchain SDK**: @stacks/transactions v6.16.1
- **State Management**: React Hooks + Context API

## Roadmap

### Phase 1 (Current) ✅

- [x] Basic lending with STX deposits
- [x] Book listing and browsing
- [x] Borrow and return functionality
- [x] User borrowed books tracking
- [x] Testnet deployment

### Phase 2 (Q1 2026)

- [ ] Multi-book borrowing
- [ ] Borrowing time limits
- [ ] Late fee mechanism
- [ ] Owner earnings from borrows
- [ ] Book rating system
- [ ] Search and filter improvements

### Phase 3 (Q2 2026)

- [ ] NFT integration for rare books
- [ ] Dispute resolution system
- [ ] Mainnet deployment
- [ ] Mobile app (React Native)
- [ ] Advanced analytics

### Phase 4 (Future)

- [ ] Multi-chain support
- [ ] DAO governance
- [ ] Decentralized moderation
- [ ] Integration with existing book platforms

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for new functionality
4. Ensure `clarinet check` passes
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Submit a pull request

**Contribution Guidelines:**

- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and well-described

## Testing

### Smart Contract Tests

```bash
# Run all contract tests
clarinet test

# Validate contract syntax
clarinet check

```

## License

MIT License - See [LICENSE](LICENSE) file for details

## Support

For issues, questions, or contributions:

- **GitHub Issues**: [Open an issue](https://github.com/yourusername/holdly/issues)
- **Email**: chigoziejacob@gmail.com
- **Discord**: [Stacks Discord](https://discord.gg/stacks)

## Acknowledgments

- Built on [Stacks blockchain](https://www.stacks.co/) - Bitcoin's programmability layer
- Uses native STX for deposits - no wrapped tokens needed
- Developed with [Clarinet](https://github.com/hirosystems/clarinet) - Clarity development tool
- Frontend powered by [Next.js](https://nextjs.org/) - React framework
- Wallet integration via [@stacks/connect](https://github.com/hirosystems/connect)
- Inspired by the DeFi and sharing economy movements

**Special Thanks:**

- Stacks Foundation for Code4STX program
- Hiro Systems for developer tools
- The Stacks community for feedback and support

---

## 🚀 Get Started Now

Ready to try Holdly?

1. **Users**: Clone this repo and follow the [Development Setup](#development-setup)
2. **Developers**: Check out our [Contributing Guidelines](#contributing)
3. **Reviewers**: Run `clarinet check` to verify contract validity

**Building on Bitcoin?** Join [Code4STX](https://stacks.org/code4stx) and earn STX for your progress!

---

**Disclaimer:** This smart contract handles financial transactions. Always audit code before deploying to mainnet. Test thoroughly on testnet before production use. Testnet STX has no real-world value.
