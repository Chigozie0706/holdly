;; Book Lending Contract with STX + sBTC Deposits

;; Contract Address
(define-constant CONTRACT_ADDRESS 'SP3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJB3SS99R.holdlyv11)

;; sBTC contract
(define-constant SBTC_CONTRACT 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token)

;; Supported token types
(define-constant TOKEN_STX "STX")
(define-constant TOKEN_SBTC "sBTC")

;; Error codes
(define-constant ERR_BOOK_NOT_FOUND (err u101))
(define-constant ERR_BOOK_NOT_AVAILABLE (err u102))
(define-constant ERR_BOOK_ALREADY_RETURNED (err u103))
(define-constant ERR_NOT_BORROWER (err u104))
(define-constant ERR_INVALID_DEPOSIT_AMOUNT (err u108))
(define-constant ERR_NOT_BOOK_OWNER (err u109))
(define-constant ERR_INVALID_STRING (err u110))
(define-constant ERR_INVALID_TOKEN (err u111))

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
(define-map owner-book-count
    principal
    uint
)

;; Track active borrow per borrower
(define-map borrower-active-borrow
    principal
    uint
)

;; Counter for book IDs
(define-data-var book-id-counter uint u0)

;;  Private helpers 

(define-private (send-stx-from-contract
        (amount uint)
        (recipient principal)
    )
    (as-contract (stx-transfer? amount tx-sender recipient))
)

(define-private (send-sbtc-from-contract
        (amount uint)
        (recipient principal)
    )
    (as-contract (contract-call? SBTC_CONTRACT transfer amount tx-sender recipient none))
)

;;  Public functions 

;; Add a new book  owner chooses deposit token
(define-public (add-book
        (title (string-utf8 200))
        (author (string-utf8 100))
        (cover-page (string-utf8 200))
        (deposit-amount uint)
        (deposit-token (string-ascii 4))
    )
    (begin
        (asserts! (> (len title) u0) ERR_INVALID_STRING)
        (asserts! (> (len author) u0) ERR_INVALID_STRING)
        (asserts! (> (len cover-page) u0) ERR_INVALID_STRING)
        (asserts! (> deposit-amount u0) ERR_INVALID_DEPOSIT_AMOUNT)
        (asserts!
            (or (is-eq deposit-token TOKEN_STX) (is-eq deposit-token TOKEN_SBTC))
            ERR_INVALID_TOKEN
        )

        (let ((book-id (+ (var-get book-id-counter) u1)))
            (map-set books book-id {
                title: title,
                author: author,
                cover-page: cover-page,
                owner: tx-sender,
                is-available: true,
                total-borrows: u0,
                deposit-amount: deposit-amount,
                deposit-token: deposit-token,
            })

            (var-set book-id-counter book-id)

            (map-set owner-book-count tx-sender
                (+ (default-to u0 (map-get? owner-book-count tx-sender)) u1)
            )

            (print {
                event: "book-added",
                book-id: book-id,
                title: title,
                author: author,
                owner: tx-sender,
                deposit-amount: deposit-amount,
                deposit-token: deposit-token,
            })

            (ok book-id)
        )
    )
)

;; Borrow a book  pays deposit in whatever token the owner set
(define-public (borrow-book (book-id uint))
    (let ((book (unwrap! (map-get? books book-id) ERR_BOOK_NOT_FOUND)))
        (asserts! (get is-available book) ERR_BOOK_NOT_AVAILABLE)

        (let (
                (amount (get deposit-amount book))
                (token (get deposit-token book))
            )
            ;; Transfer deposit based on token type
            (try! (if (is-eq token TOKEN_STX)
                (stx-transfer? amount tx-sender CONTRACT_ADDRESS)
                (contract-call? SBTC_CONTRACT transfer amount tx-sender
                    CONTRACT_ADDRESS none
                )
            ))

            (map-set books book-id
                (merge book {
                    is-available: false,
                    total-borrows: (+ (get total-borrows book) u1),
                })
            )

            (map-set borrows book-id {
                borrower: tx-sender,
                borrowed-at: burn-block-height,
                deposit-amount: amount,
                deposit-token: token,
            })

            (map-set borrower-active-borrow tx-sender book-id)

            (print {
                event: "book-borrowed",
                book-id: book-id,
                borrower: tx-sender,
                deposit: amount,
                deposit-token: token,
                borrowed-at: burn-block-height,
            })

            (ok true)
        )
    )
)

;; Return a book  refunds deposit in original token
(define-public (return-book (book-id uint))
    (let (
            (book (unwrap! (map-get? books book-id) ERR_BOOK_NOT_FOUND))
            (borrow (unwrap! (map-get? borrows book-id) ERR_BOOK_ALREADY_RETURNED))
        )
        (asserts! (is-eq tx-sender (get borrower borrow)) ERR_NOT_BORROWER)

        (let (
                (amount (get deposit-amount borrow))
                (token (get deposit-token borrow))
                (borrower (get borrower borrow))
            )
            ;; Refund in original token
            (try! (if (is-eq token TOKEN_STX)
                (send-stx-from-contract amount borrower)
                (send-sbtc-from-contract amount borrower)
            ))

            (map-set books book-id (merge book { is-available: true }))
            (map-delete borrows book-id)
            (map-delete borrower-active-borrow tx-sender)

            (print {
                event: "book-returned",
                book-id: book-id,
                borrower: tx-sender,
                deposit-token: token,
                returned-at: burn-block-height,
            })

            (ok true)
        )
    )
)

;; Update a book (only owner, only when available)
(define-public (update-book
        (book-id uint)
        (title (string-utf8 200))
        (author (string-utf8 100))
        (cover-page (string-utf8 200))
        (deposit-amount uint)
        (deposit-token (string-ascii 4))
    )
    (let ((book (unwrap! (map-get? books book-id) ERR_BOOK_NOT_FOUND)))
        (asserts! (is-eq tx-sender (get owner book)) ERR_NOT_BOOK_OWNER)
        (asserts! (get is-available book) ERR_BOOK_NOT_AVAILABLE)
        (asserts! (> (len title) u0) ERR_INVALID_STRING)
        (asserts! (> (len author) u0) ERR_INVALID_STRING)
        (asserts! (> (len cover-page) u0) ERR_INVALID_STRING)
        (asserts! (> deposit-amount u0) ERR_INVALID_DEPOSIT_AMOUNT)
        (asserts!
            (or (is-eq deposit-token TOKEN_STX) (is-eq deposit-token TOKEN_SBTC))
            ERR_INVALID_TOKEN
        )

        (map-set books book-id
            (merge book {
                title: title,
                author: author,
                cover-page: cover-page,
                deposit-amount: deposit-amount,
                deposit-token: deposit-token,
            })
        )

        (print {
            event: "book-updated",
            book-id: book-id,
            title: title,
            author: author,
            deposit-token: deposit-token,
            owner: tx-sender,
        })

        (ok true)
    )
)

;; Delete a book (only owner, only when available)
(define-public (delete-book (book-id uint))
    (let ((book (unwrap! (map-get? books book-id) ERR_BOOK_NOT_FOUND)))
        (asserts! (is-eq tx-sender (get owner book)) ERR_NOT_BOOK_OWNER)
        (asserts! (get is-available book) ERR_BOOK_NOT_AVAILABLE)

        (map-delete books book-id)

        (map-set owner-book-count tx-sender
            (- (default-to u0 (map-get? owner-book-count tx-sender)) u1)
        )

        (print {
            event: "book-deleted",
            book-id: book-id,
            owner: tx-sender,
        })

        (ok true)
    )
)

;;  Read-only functions 

(define-read-only (get-book (book-id uint))
    (map-get? books book-id)
)

(define-read-only (get-borrow (book-id uint))
    (map-get? borrows book-id)
)

(define-read-only (get-book-count)
    (ok (var-get book-id-counter))
)

(define-read-only (is-book-available (book-id uint))
    (match (map-get? books book-id)
        book (ok (get is-available book))
        ERR_BOOK_NOT_FOUND
    )
)

(define-read-only (get-book-deposit-amount (book-id uint))
    (match (map-get? books book-id)
        book (ok (get deposit-amount book))
        ERR_BOOK_NOT_FOUND
    )
)

(define-read-only (get-contract-stx-balance)
    (ok (stx-get-balance CONTRACT_ADDRESS))
)

(define-read-only (get-owner-book-count (owner principal))
    (ok (default-to u0 (map-get? owner-book-count owner)))
)

(define-read-only (get-active-borrow-by-borrower (borrower principal))
    (match (map-get? borrower-active-borrow borrower)
        book-id (match (map-get? borrows book-id)
            borrow (ok (some {
                book-id: book-id,
                borrower: (get borrower borrow),
                borrowed-at: (get borrowed-at borrow),
                deposit-amount: (get deposit-amount borrow),
                deposit-token: (get deposit-token borrow),
            }))
            (ok none)
        )
        (ok none)
    )
)
