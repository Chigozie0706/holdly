;; Book Lending Contract with STX + sBTC Deposits

;; Contract Address
(define-constant CONTRACT_ADDRESS 'SP3N8PR8ARF68BC45EDK4MWZ3WWDM74CFJB3SS99R.holdlyv19)

;; sBTC contract
(define-constant SBTC_CONTRACT 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token)

;; Supported token types
(define-constant TOKEN_STX "STX")
(define-constant TOKEN_SBTC "sBTC")

;; Minimum deposit
(define-constant MIN_DEPOSIT u100000)

;;  Borrow duration — ~7 days in Bitcoin blocks (1 block ≈ 10 min)
;; 7 days * 24 hours * 6 blocks/hour = 1008 blocks
(define-constant BORROW_DURATION_BLOCKS u1008)


;; Error codes
(define-constant ERR_BOOK_NOT_FOUND (err u101))
(define-constant ERR_BOOK_NOT_AVAILABLE (err u102))
(define-constant ERR_BOOK_ALREADY_RETURNED (err u103))
(define-constant ERR_NOT_BORROWER (err u104))
(define-constant ERR_INVALID_DEPOSIT_AMOUNT (err u108))
(define-constant ERR_NOT_BOOK_OWNER (err u109))
(define-constant ERR_INVALID_STRING (err u110))
(define-constant ERR_INVALID_TOKEN (err u111))
(define-constant ERR_INVALID_SCORE (err u114))
(define-constant ERR_NOT_ELIGIBLE_TO_RATE (err u115))
(define-constant ERR_ALREADY_RATED (err u116))
(define-constant ERR_NOT_OVERDUE (err u117)) 
(define-constant ERR_NOT_OWNER (err u118))      

;;  Maps 

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

(define-map borrows
    uint
    {
        borrower: principal,
        borrowed-at: uint,
        due-date: uint,   
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

;; Scalable borrow history storage
(define-map user-borrow-history
    { user: principal, index: uint }
    {
        book-id: uint,
        borrowed-at: uint,
        returned-at: uint,
        deposit-amount: uint,
        deposit-token: (string-ascii 4),
        was-overdue: bool,
    }
)

;; Track how many history entries each user has
(define-map user-history-count principal uint)

;; Store ratings per book
(define-map book-ratings
    uint
    {
        total-score: uint,
        count: uint,
    }
)

;; Track who has rated which book
(define-map user-book-rated
    { user: principal, book-id: uint }
    bool
)

;; Track which books a user has returned (rating eligibility)
(define-map user-returned-books
    { user: principal, book-id: uint }
    bool
)

;; Counter for book IDs
(define-data-var book-id-counter uint u0)

;;  Private helpers 

(define-private (send-stx-from-contract (amount uint) (recipient principal))
    (as-contract
        (stx-transfer? amount tx-sender recipient)
    )
)

(define-private (send-sbtc-from-contract (amount uint) (recipient principal))
    (as-contract
        (contract-call? SBTC_CONTRACT transfer amount tx-sender recipient none)
    )
)

;;  Public functions 

;; Add a new book
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
        (asserts! (>= deposit-amount MIN_DEPOSIT) ERR_INVALID_DEPOSIT_AMOUNT)
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

;; Borrow a book
(define-public (borrow-book (book-id uint))
    (let ((book (unwrap! (map-get? books book-id) ERR_BOOK_NOT_FOUND)))
        (asserts! (get is-available book) ERR_BOOK_NOT_AVAILABLE)

        (let (
                (amount (get deposit-amount book))
                (token (get deposit-token book))

                ;;  Calculate due date at borrow time
                (due-date (+ burn-block-height BORROW_DURATION_BLOCKS))

            )
            (try! (if (is-eq token TOKEN_STX)
                (stx-transfer? amount tx-sender CONTRACT_ADDRESS)
                (contract-call? SBTC_CONTRACT transfer amount tx-sender CONTRACT_ADDRESS none)
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
                due-date: due-date,
                deposit-amount: amount,
                deposit-token: token,
            })

            (map-set borrower-active-borrow tx-sender book-id)

            (map-set user-total-borrows tx-sender
                (+ (default-to u0 (map-get? user-total-borrows tx-sender)) u1)
            )

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

;; Return a book
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
                (overdue (> burn-block-height ()))
                (history-index
                    (+ (default-to u0 (map-get? user-history-count tx-sender)) u1)
                )
            )
            ;; Refund deposit
            (try! (if (is-eq token TOKEN_STX)
                (send-stx-from-contract amount borrower)
                (send-sbtc-from-contract amount borrower)
            ))

            ;; Update book availability
            (map-set books book-id (merge book { is-available: true }))

            ;; Clear borrow record
            (map-delete borrows book-id)
            (map-delete borrower-active-borrow tx-sender)

            ;; Store history entry
            (map-set user-borrow-history
                { user: tx-sender, index: history-index }
                {
                    book-id: book-id,
                    borrowed-at: (get borrowed-at borrow),
                    returned-at: burn-block-height,
                    deposit-amount: amount,
                    deposit-token: token,
                }
            )

            ;; Update history count
            (map-set user-history-count tx-sender history-index)

            ;; Mark user as eligible to rate this book
            (map-set user-returned-books { user: tx-sender, book-id: book-id } true)

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

;; Rate a book
(define-public (rate-book (book-id uint) (score uint))
    (begin
        (asserts! (is-some (map-get? books book-id)) ERR_BOOK_NOT_FOUND)
        (asserts! (and (>= score u1) (<= score u5)) ERR_INVALID_SCORE)
        (asserts!
            (default-to false
                (map-get? user-returned-books { user: tx-sender, book-id: book-id })
            )
            ERR_NOT_ELIGIBLE_TO_RATE
        )
        (asserts!
            (not (default-to false
                (map-get? user-book-rated { user: tx-sender, book-id: book-id })
            ))
            ERR_ALREADY_RATED
        )

        (let ((current (default-to { total-score: u0, count: u0 } (map-get? book-ratings book-id))))
            (map-set book-ratings book-id {
                total-score: (+ (get total-score current) score),
                count: (+ (get count current) u1),
            })
        )

        (map-set user-book-rated { user: tx-sender, book-id: book-id } true)

        (print {
            event: "book-rated",
            book-id: book-id,
            rater: tx-sender,
            score: score,
        })

        (ok true)
    )
)

;; Update a book
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
        (asserts! (>= deposit-amount MIN_DEPOSIT) ERR_INVALID_DEPOSIT_AMOUNT)
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

;; Delete a book
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

(define-read-only (get-user-total-borrows (user principal))
    (ok (default-to u0 (map-get? user-total-borrows user)))
)

(define-read-only (get-user-history-count (user principal))
    (ok (default-to u0 (map-get? user-history-count user)))
)

(define-read-only (get-user-history-item (user principal) (index uint))
    (ok (map-get? user-borrow-history { user: user, index: index }))
)

(define-read-only (get-book-rating (book-id uint))
    (match (map-get? book-ratings book-id)
        rating (ok {
            total-score: (get total-score rating),
            count: (get count rating),
            average: (if (> (get count rating) u0)
                (/ (* (get total-score rating) u10) (get count rating))
                u0
            ),
        })
        (ok { total-score: u0, count: u0, average: u0 })
    )
)

(define-read-only (can-user-rate (user principal) (book-id uint))
    (ok {
        eligible: (default-to false
            (map-get? user-returned-books { user: user, book-id: book-id })
        ),
        already-rated: (default-to false
            (map-get? user-book-rated { user: user, book-id: book-id })
        ),
    })
)