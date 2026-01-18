# Holdly - Decentralized Book Lending Platform

A Clarity smart contract that enables peer-to-peer book lending with sBTC collateral deposits on the Stacks blockchain.

## Overview

Holdly allows users to:

- **List books** with custom deposit amounts
- **Borrow books** by depositing sBTC as collateral
- **Return books** and automatically receive their deposit back
- **Track lending history** and book availability

## Features

✅ Custom deposit amounts per book (set by book owner)  
✅ Fully refundable sBTC deposits  
✅ Automatic deposit return on book return  
✅ Book ownership tracking  
✅ Borrow history and statistics  
✅ Deposit amount updates (when book is available)

## Contract Details

- **Network**: Stacks Blockchain (Testnet)
- **Contract Address**: `ST3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJAGZBY3K.holdlyv1`
- **API Endpoint**: https://api.testnet.hiro.so
- **Token**: sBTC (SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token)
- **Clarity Version**: 4
- **Epoch**: Latest
- **Status**: ✅ Deployed and Confirmed

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

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) installed
- Node.js and npm (for testing)

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd holdly

# Check contract syntax
clarinet check

# Run tests
clarinet test
```

### Testnet Deployment ✅

The contract has been successfully deployed to Stacks Testnet:

```
Broadcasting transactions to https://api.testnet.hiro.so
🟩 Publish ST3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJAGZBY3K.holdlyv1
Transaction confirmed
```

**Deployed Contract:**

- Address: `ST3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJAGZBY3K.holdlyv1`
- Explorer: [View on Stacks Explorer](https://explorer.hiro.so/txid/ST3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJAGZBY3K.holdlyv1?chain=testnet)

### Integration Testing with sBTC

**Note:** sBTC transfers require the sBTC token contract to be deployed and functional.

## Use Cases

1. **Community Libraries** - Neighborhoods can create decentralized book sharing
2. **Academic Institutions** - Students can lend textbooks with deposit protection
3. **Collectors** - Rare book owners can safely lend valuable items
4. **Book Clubs** - Members can share books with collateral assurance

## Security Considerations

⚠️ **Important Notes:**

- Deposits are held in the smart contract and returned automatically
- Only the borrower can return a book they borrowed
- Book owners can only update deposits when books are available
- All sBTC transfers are protected by Clarity's type system
- The contract has been designed to prevent common attack vectors

## Roadmap

- [ ] Multi-book borrowing
- [ ] Late fees mechanism / Owner claims fund
- [ ] Book rating system
- [ ] Borrowing time limits
- [ ] Dispute resolution
- [ ] NFT integration for rare books

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or contributions:

- Open an issue on GitHub
- Contact: [chigoziejacob@gmail.com]

## Acknowledgments

Built on Stacks blockchain using Clarity smart contracts and sBTC.

---

**Disclaimer:** This smart contract handles financial transactions. Always audit code before deploying to mainnet and never invest more than you can afford to lose.
