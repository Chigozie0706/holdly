;; Book Lending Contract with STX + sBTC Deposits

;; Contract Address
(define-constant CONTRACT_ADDRESS 'SP3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJB3SS99R.holdlyv13)

;; sBTC contract
(define-constant SBTC_CONTRACT 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token)

;; Supported token types
(define-constant TOKEN_STX "STX")
(define-constant TOKEN_SBTC "sBTC")

;; Minimum deposit
(define-constant MIN_DEPOSIT u100000)


;; Error codes
(define-constant ERR_BOOK_NOT_FOUND (err u101))
(define-constant ERR_BOOK_NOT_AVAILABLE (err u102))
(define-constant ERR_BOOK_ALREADY_RETURNED (err u103))
(define-constant ERR_NOT_BORROWER (err u104))
(define-constant ERR_INVALID_DEPOSIT_AMOUNT (err u108))
(define-constant ERR_NOT_BOOK_OWNER (err u109))
(define-constant ERR_INVALID_STRING (err u110))
(define-constant ERR_INVALID_TOKEN (err u111))
(define-constant ERR_HISTORY_FULL (err u113))
(define-constant ERR_INVALID_SCORE (err u114))
(define-constant ERR_NOT_ELIGIBLE_TO_RATE (err u115))
(define-constant ERR_ALREADY_RATED (err u116))


;;  Maps 

;; Data structure for books
(define-map books
    uint
    {
        title: (string-utf8 200),
        author: (string-utf8 100),
        cover-page: (string-utf8 200),
        owner: principal,
        is-available: bool,
        total-borrows: uint,
        deposit-amount: uint,
        deposit-token: (string-ascii 4),
    }
)

;; Data structure for active borrows
(define-map borrows
    uint
    {
        borrower: principal,
        borrowed-at: uint,
        deposit-amount: uint,
        deposit-token: (string-ascii 4),
    }
)


;; Track number of books per owner
(define-map owner-book-count principal uint)


;; Track active borrow per borrower
(define-map borrower-active-borrow principal uint)

;; Track total borrows per user
(define-map user-total-borrows principal uint)


;; Store borrow history per user (up to 20 entries)
(define-map user-borrow-history
    principal
    (list 20 {
        book-id: uint,
        borrowed-at: uint,
        returned-at: uint,
        deposit-amount: uint,
        deposit-token: (string-ascii 4),
    })
)

;; Store ratings per book
(define-map book-ratings
    uint
    {
        total-score: uint,
        count: uint,
    }
)


;; Track who has rated which book (prevent double rating)
(define-map user-book-rated
    { user: principal, book-id: uint }
    bool
)

