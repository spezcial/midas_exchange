# OTC API — Frontend Integration Guide

This document covers all OTC (over-the-counter) endpoints, data models, state transitions, and role-based access rules needed to build the OTC UI.

---

## Table of Contents

1. [Overview](#overview)
2. [Roles & Access](#roles--access)
3. [Status Machine](#status-machine)
4. [Data Models](#data-models)
5. [Client Endpoints](#client-endpoints)
6. [Operator / Admin Endpoints](#operator--admin-endpoints)
7. [Error Responses](#error-responses)
8. [Full Flow Walkthrough](#full-flow-walkthrough)

---

## Overview

OTC allows clients with KYC Level ≥ 2 to request large manual exchanges at negotiated rates. An operator takes the order, negotiates via an in-order chat (text messages and offer cards), and once both sides agree, the client makes an external payment. The operator confirms receipt and marks the order complete — at which point wallet balances are adjusted automatically.

---

## Roles & Access

| Role | What they can do |
|---|---|
| `client` | Create, view, message, send/accept/reject offers, cancel own orders |
| `operator` | Take, view all, message, send/accept/reject offers, confirm payment, complete, cancel |
| `admin` / `super_admin` | Same as operator |

**Authentication:** All endpoints require `Authorization: Bearer <JWT>` header.

---

## Status Machine

```
awaiting_review
      │
      ▼  (operator takes order)
 negotiating
      │
      ▼  (either side accepts an offer)
awaiting_payment  ──── (deadline expires) ───► expired
      │                                            │
      ▼  (operator confirms payment received)      │
payment_received  ◄────────────────────────────────┘
      │
      ▼  (operator completes order → wallets adjusted)
  completed

Any non-terminal status can also go to:
  cancelled  (client: only from awaiting_review / negotiating)
             (operator/admin: from any non-terminal status)
```

**Terminal statuses:** `completed`, `cancelled`, `expired`

**Payment deadline:** Set to **30 minutes** from offer acceptance. If the deadline passes before `ConfirmPaymentReceived` is called, the order is lazily transitioned to `expired` on the next `GET` request. An operator can still call `payment-received` on an expired order to recover it.

---

## Data Models

### OTCOrder

```json
{
  "id": 1,
  "uid": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": 10,
  "operator_id": 5,
  "from_currency_id": 3,
  "to_currency_id": 5,
  "from_amount": 1000.0,
  "proposed_rate": 0.05,
  "agreed_rate": 0.049,
  "agreed_from_amount": 1000.0,
  "to_amount": 49.0,
  "status": "awaiting_payment",
  "comment": "urgent",
  "cancel_reason": null,
  "cancelled_by": null,
  "payment_deadline": "2026-03-19T15:30:00Z",
  "created_at": "2026-03-19T15:00:00Z",
  "updated_at": "2026-03-19T15:01:00Z"
}
```

| Field | Description |
|---|---|
| `uid` | Public identifier — use this in all API calls |
| `from_amount` | Amount client originally requested to exchange |
| `proposed_rate` | Rate the client proposed |
| `agreed_rate` | Rate both sides agreed on (set after offer acceptance) |
| `agreed_from_amount` | Agreed amount to deduct from client wallet |
| `to_amount` | Amount client will receive (`agreed_from_amount × agreed_rate`) |
| `payment_deadline` | ISO 8601 UTC; null until an offer is accepted |
| `cancel_reason` / `cancelled_by` | Set on cancellation; `cancelled_by` is the role string |

### OTCOrderDetail

Returned by single-order GET endpoints. Extends `OTCOrder` with embedded currencies and full message history:

```json
{
  "id": 1,
  "uid": "550e8400-...",
  "...": "all OTCOrder fields",
  "from_currency": {
    "id": 3,
    "code": "USDT",
    "name": "Tether",
    "symbol": "₮",
    "is_active": true,
    "is_crypto": true
  },
  "to_currency": {
    "id": 5,
    "code": "KZT",
    "name": "Kazakhstani Tenge",
    "symbol": "₸",
    "is_active": true,
    "is_crypto": false
  },
  "messages": [
    {
      "id": 1,
      "order_id": 1,
      "sender_id": 10,
      "sender_role": "client",
      "message_type": "text",
      "content": "Hello, I need this done today",
      "offer_rate": null,
      "offer_from_amount": null,
      "offer_to_amount": null,
      "offer_status": null,
      "created_at": "2026-03-19T15:01:00Z"
    },
    {
      "id": 2,
      "order_id": 1,
      "sender_id": 5,
      "sender_role": "operator",
      "message_type": "offer",
      "content": null,
      "offer_rate": 0.049,
      "offer_from_amount": 1000.0,
      "offer_to_amount": 49.0,
      "offer_status": "pending",
      "created_at": "2026-03-19T15:02:00Z"
    }
  ]
}
```

### OTCMessage

| Field | Values | Description |
|---|---|---|
| `message_type` | `"text"` \| `"offer"` | Text chat vs. offer card |
| `sender_role` | `"client"` \| `"operator"` \| `"admin"` etc. | Who sent it |
| `offer_status` | `"pending"` \| `"accepted"` \| `"rejected"` \| `null` | Only set for offer messages |
| `offer_rate` | number \| null | Rate in the offer |
| `offer_from_amount` | number \| null | From-amount in the offer |
| `offer_to_amount` | number \| null | To-amount in the offer (`from × rate`) |

---

## Client Endpoints

Base path: `/api/v1/otc`
Auth: JWT (role `client`)

---

### Create Order

```
POST /api/v1/otc/orders
```

**Request:**
```json
{
  "from_currency_id": 3,
  "to_currency_id": 5,
  "from_amount": 1000.0,
  "proposed_rate": 0.05,
  "comment": "urgent, please respond fast"
}
```

| Field | Required | Description |
|---|---|---|
| `from_currency_id` | ✅ | Currency ID to sell |
| `to_currency_id` | ✅ | Currency ID to buy |
| `from_amount` | ✅ | Must be > 0 |
| `proposed_rate` | ✅ | Must be > 0 |
| `comment` | ❌ | Optional note to operator |

**Response `201`:**
```json
{
  "id": 1,
  "uid": "550e8400-...",
  "status": "awaiting_review",
  "...": "full OTCOrder object"
}
```

**Errors:**
- `400 KYC level 2 or higher required to create an OTC order` — client's KYC level is below 2

---

### List My Orders

```
GET /api/v1/otc/orders?status=negotiating&limit=20&offset=0
```

**Query params:**

| Param | Default | Description |
|---|---|---|
| `status` | (all) | Filter by status string |
| `limit` | 20 | Max 100 |
| `offset` | 0 | Pagination offset |

**Response `200`:**
```json
{
  "orders": [ /* OTCOrder[] */ ],
  "total": 42
}
```

---

### Get Order Detail

```
GET /api/v1/otc/orders/:uid
```

Returns full `OTCOrderDetail` including currency info and all messages. The client can only view their own orders.

**Response `200`:** `OTCOrderDetail`

**Errors:**
- `404 order not found`
- `403 access denied` — order belongs to a different user

---

### Send Text Message

```
POST /api/v1/otc/orders/:uid/messages
```

Only allowed while `status = negotiating`.

**Request:**
```json
{ "content": "Can you do 0.048?" }
```

**Response `201`:** `OTCMessage`

---

### Send Offer

```
POST /api/v1/otc/orders/:uid/offers
```

Only allowed while `status = negotiating`. The client can counter-propose a rate.

**Request:**
```json
{
  "offer_rate": 0.048,
  "offer_from_amount": 1000.0
}
```

`offer_to_amount` is calculated server-side as `offer_from_amount × offer_rate`.

**Response `201`:** `OTCMessage` (type `"offer"`, status `"pending"`)

---

### Accept Offer

```
PUT /api/v1/otc/orders/:uid/offers/:messageID/accept
```

Accepts an **operator's** pending offer. Moves order to `awaiting_payment` and sets 30-minute `payment_deadline`. Only the opposing party can accept (you cannot accept your own offer).

**Response `200`:**
```json
{ "message": "offer accepted" }
```

**Errors:**
- `400 offer is no longer pending`
- `400 cannot accept your own offer`
- `400 order must be negotiating to accept an offer`

---

### Reject Offer

```
PUT /api/v1/otc/orders/:uid/offers/:messageID/reject
```

Rejects an **operator's** pending offer. Order stays in `negotiating`.

**Response `200`:**
```json
{ "message": "offer rejected" }
```

---

### Cancel Order

```
DELETE /api/v1/otc/orders/:uid
```

Client can cancel only from `awaiting_review` or `negotiating`.

**Request:**
```json
{ "reason": "changed my mind" }
```

`reason` is optional (empty string is accepted).

**Response `200`:**
```json
{ "message": "order cancelled" }
```

**Errors:**
- `400 order can only be cancelled from awaiting_review or negotiating status`
- `400 not authorized to cancel this order`

---

## Operator / Admin Endpoints

Base path: `/api/v1/admin/otc`
Auth: JWT (roles `operator`, `admin`, `super_admin`)

---

### List All Orders

```
GET /api/v1/admin/otc/orders?status=awaiting_review&email=alice&limit=20&offset=0
```

**Query params:**

| Param | Default | Description |
|---|---|---|
| `status` | (all) | Filter by status |
| `email` | (all) | Filter by client email (partial, case-insensitive) |
| `limit` | 20 | Max 100 |
| `offset` | 0 | Pagination offset |

**Response `200`:**
```json
{
  "orders": [ /* OTCOrder[] */ ],
  "total": 15
}
```

---

### Get Order Detail

```
GET /api/v1/admin/otc/orders/:uid
```

**Response `200`:** `OTCOrderDetail` (includes all messages)

---

### Take Order

```
PUT /api/v1/admin/otc/orders/:uid/take
```

Assigns the calling operator to the order and moves it from `awaiting_review` → `negotiating`.

**Response `200`:**
```json
{ "message": "order taken" }
```

**Errors:**
- `400 order must be in awaiting_review status to take`

---

### Send Text Message

```
POST /api/v1/admin/otc/orders/:uid/messages
```

Only allowed while `status = negotiating`.

**Request:**
```json
{ "content": "I can offer 0.049 rate" }
```

**Response `201`:** `OTCMessage`

---

### Send Offer

```
POST /api/v1/admin/otc/orders/:uid/offers
```

Only allowed while `status = negotiating`.

**Request:**
```json
{
  "offer_rate": 0.049,
  "offer_from_amount": 1000.0
}
```

**Response `201`:** `OTCMessage` (type `"offer"`, status `"pending"`)

---

### Accept Offer

```
PUT /api/v1/admin/otc/orders/:uid/offers/:id/accept
```

Accepts a **client's** pending offer. Moves order to `awaiting_payment`.

**Response `200`:**
```json
{ "message": "offer accepted" }
```

---

### Reject Offer

```
PUT /api/v1/admin/otc/orders/:uid/offers/:id/reject
```

**Response `200`:**
```json
{ "message": "offer rejected" }
```

---

### Confirm Payment Received

```
PUT /api/v1/admin/otc/orders/:uid/payment-received
```

Confirms the client's external payment was received. Moves order from `awaiting_payment` (or `expired`) → `payment_received`. Only the assigned operator can call this.

**Response `200`:**
```json
{ "message": "payment received confirmed" }
```

**Errors:**
- `400 order must be in awaiting_payment or expired status`
- `400 only the assigned operator can confirm payment`

---

### Complete Order

```
PUT /api/v1/admin/otc/orders/:uid/complete
```

Finalizes the deal. Only the assigned operator can call this from `payment_received` status.

**What happens server-side:**
1. Deducts `agreed_from_amount` from the client's from-currency wallet
2. Credits `to_amount` to the client's to-currency wallet
3. Marks order `completed`

**Response `200`:**
```json
{ "message": "order completed" }
```

**Errors:**
- `400 order must be in payment_received status to complete`
- `400 only the assigned operator can complete the order`
- `400 client has insufficient balance to complete the OTC order`
- `400 client from-wallet not found: ...`
- `400 client to-wallet not found: ...`

---

### Cancel Order

```
DELETE /api/v1/admin/otc/orders/:uid
```

Operator/admin can cancel from any non-terminal status.

**Request:**
```json
{ "reason": "client did not respond" }
```

**Response `200`:**
```json
{ "message": "order cancelled" }
```

**Errors:**
- `400 order is already in a terminal status`

---

## Error Responses

All errors follow the same shape:

```json
{
  "error": "human-readable message"
}
```

Common HTTP codes:

| Code | Meaning |
|---|---|
| `400` | Validation or business rule violation |
| `401` | Missing or invalid JWT |
| `403` | Valid JWT but wrong role or wrong ownership |
| `404` | Order / message not found |
| `500` | Internal server error |

---

## Full Flow Walkthrough

```
1. Client (KYC ≥ 2) creates order
   POST /api/v1/otc/orders
   → status: awaiting_review

2. Operator takes order
   PUT /api/v1/admin/otc/orders/:uid/take
   → status: negotiating

3. Chat + negotiation (any number of rounds)
   POST /api/v1/admin/otc/orders/:uid/offers   (operator proposes)
   POST /api/v1/otc/orders/:uid/offers          (client counter-proposes)
   POST /api/v1/otc/orders/:uid/messages        (either side texts)

4. One side accepts the other's offer
   PUT  /api/v1/otc/orders/:uid/offers/:id/accept        (client accepts)
   PUT  /api/v1/admin/otc/orders/:uid/offers/:id/accept  (operator accepts)
   → status: awaiting_payment
   → payment_deadline set to NOW + 30 min

   ↓ Client makes external payment (bank transfer, crypto, etc.)

5. Operator confirms payment
   PUT /api/v1/admin/otc/orders/:uid/payment-received
   → status: payment_received

6. Operator completes
   PUT /api/v1/admin/otc/orders/:uid/complete
   → client from-wallet debited by agreed_from_amount
   → client to-wallet credited by to_amount
   → status: completed
```

---

## UI Hints

- **Polling vs. real-time:** There is no WebSocket channel for OTC chat yet. Poll `GET /api/v1/otc/orders/:uid` at a reasonable interval (e.g. every 5 s) while the order is active to pick up new messages and status changes.
- **Payment countdown:** Use `payment_deadline` from the order to render a live countdown timer. When it hits zero, the next poll will return `status: expired`.
- **Offer cards:** Render messages with `message_type = "offer"` as special cards showing `offer_rate`, `offer_from_amount`, `offer_to_amount`, and `offer_status`. Show Accept/Reject buttons only when `offer_status = "pending"` and the message was sent by the other party (compare `sender_id` vs. the logged-in user's ID).
- **Currency IDs:** Fetch available currencies from `GET /api/v1/wallet/currencies` to build the pair selector.
