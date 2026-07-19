# Mahrostack API Guide

Simple accounting API for **products**, **purchases**, and **sales**.  
No authentication — any client can call every endpoint.

---

## Quick start

### 1. Environment

Copy `.env.example` and set a Postgres URL:

```env
PORT=3030
DATABASE_URL=postgresql://user:password@localhost:5432/mahrostack
```

`POSTGRES_URI` is also accepted (same meaning as `DATABASE_URL`).

### 2. Database + server

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Base URL (default):

```text
http://localhost:3030
```

API prefix:

```text
http://localhost:3030/api
```

### 3. Health check

```http
GET /health
```

```json
{ "status": "ok" }
```

---

## Conventions

| Topic | Rule |
|--------|------|
| Auth | None |
| Content-Type | `application/json` (body limit **1mb**) |
| IDs | UUID strings |
| Money | Always returned as **strings** with 2 decimals (e.g. `"12.50"`) |
| Money input | Number or string accepted (`12.5` or `"12.50"`) |
| Success body | `{ "data": ... }` |
| Error body | `{ "error": { "code": "...", "message": "..." } }` |
| Delete success | `204 No Content` (empty body) |
| CORS | Enabled for all origins |

### Totals

- `lineTotal` and document `total` are **computed by the server**.
- Do **not** send `lineTotal` / `total` on create — they are ignored if sent.

### Stock rules

| Action | Stock effect |
|--------|----------------|
| Create purchase | `stock += quantity` per product |
| Delete purchase | `stock -= quantity` per product |
| Create sale | `stock -= quantity` (fails if insufficient) |
| Delete sale | `stock += quantity` (restores stock) |

Purchases and sales run in **database transactions**.

---

## Error responses

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "name is required"
  }
}
```

| Status | Code | When |
|--------|------|------|
| `400` | `BAD_REQUEST` | Validation failed / missing fields / invalid money or dates |
| `404` | `NOT_FOUND` | Resource or route not found |
| `409` | `CONFLICT` | Duplicate SKU, product in use, etc. |
| `409` | `INSUFFICIENT_STOCK` | Sale quantity exceeds available stock |
| `500` | `INTERNAL_ERROR` | Unexpected server/DB error |

---

## Products

Catalog items with optional SKU, selling price, and on-hand stock.

### List products

```http
GET /api/products
GET /api/products?q=widget
```

| Query | Type | Description |
|-------|------|-------------|
| `q` | string | Optional. Case-insensitive search on `name` or `sku` |

**Response `200`**

```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "USB Cable",
      "sku": "USB-01",
      "description": "1m Type-C",
      "unitPrice": "9.99",
      "stock": 40,
      "createdAt": "2026-07-19T09:00:00.000Z",
      "updatedAt": "2026-07-19T09:00:00.000Z"
    }
  ]
}
```

Sorted by `createdAt` descending.

### Get product

```http
GET /api/products/:id
```

**Response `200`** — same object shape as one list item.  
**Response `404`** — product not found.

### Create product

```http
POST /api/products
Content-Type: application/json
```

```json
{
  "name": "USB Cable",
  "sku": "USB-01",
  "description": "1m Type-C",
  "unitPrice": 9.99,
  "stock": 0
}
```

| Field | Required | Rules |
|-------|----------|--------|
| `name` | yes | Non-empty string (trimmed) |
| `sku` | no | Unique if set; empty → `null` |
| `description` | no | |
| `unitPrice` | no | Default `0`, must be `>= 0` |
| `stock` | no | Default `0`, non-negative integer |

**Response `201`**

```json
{
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "USB Cable",
    "sku": "USB-01",
    "description": "1m Type-C",
    "unitPrice": "9.99",
    "stock": 0,
    "createdAt": "2026-07-19T09:00:00.000Z",
    "updatedAt": "2026-07-19T09:00:00.000Z"
  }
}
```

**Response `409`** — `sku already exists`.

### Update product

```http
PATCH /api/products/:id
Content-Type: application/json
```

```json
{
  "name": "USB Cable Pro",
  "unitPrice": "12.00",
  "stock": 10
}
```

All fields optional. Same validation rules as create for fields you send.

**Response `200`** — updated product.  
**Response `404`** — not found.  
**Response `409`** — SKU conflict.

### Delete product

```http
DELETE /api/products/:id
```

**Response `204`** — deleted.  
**Response `404`** — not found.  
**Response `409`** — product is referenced by purchases or sales.

---

## Purchases

Purchase headers with line items. Creating a purchase **increases** stock.

### List purchases

```http
GET /api/purchases
```

**Response `200`**

```json
{
  "data": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "total": "199.80",
      "purchasedAt": "2026-07-19T10:00:00.000Z",
      "createdAt": "2026-07-19T10:00:00.000Z",
      "updatedAt": "2026-07-19T10:00:00.000Z",
      "lines": [
        {
          "id": "22222222-2222-2222-2222-222222222222",
          "productId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "quantity": 20,
          "unitCost": "9.99",
          "lineTotal": "199.80",
          "product": {
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "name": "USB Cable",
            "sku": "USB-01"
          }
        }
      ]
    }
  ]
}
```

Sorted by `purchasedAt` descending. Each item includes `lines`.

### Get purchase

```http
GET /api/purchases/:id
```

**Response `200`** — one purchase with lines.  
**Response `404`** — not found.

### Create purchase

```http
POST /api/purchases
Content-Type: application/json
```

```json
{
  "purchasedAt": "2026-07-19T10:00:00.000Z",
  "lines": [
    {
      "productId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "quantity": 20,
      "unitCost": 9.99
    }
  ]
}
```

| Field | Required | Rules |
|-------|----------|--------|
| `purchasedAt` | no | ISO date string; default = now |
| `lines` | yes | Non-empty array |
| `lines[].productId` | yes | Existing product UUID |
| `lines[].quantity` | yes | Positive integer |
| `lines[].unitCost` | yes | `>= 0` |

Server computes:

- `lineTotal = unitCost × quantity`
- `total = sum(lineTotal)`
- stock increment per product (quantities summed if the same product appears on multiple lines)

**Response `201`** — created purchase with lines.  
**Response `400`** — validation / unknown product / invalid date.

### Delete purchase

```http
DELETE /api/purchases/:id
```

Reverses stock for all lines, then deletes the purchase (lines cascade).

**Response `204`**  
**Response `404`** — not found.

> Note: stock is decremented even if it would go negative. Prefer careful deletes in production workflows.

---

## Sales

Sale headers with line items. Creating a sale **decreases** stock and requires enough quantity on hand.

### List sales

```http
GET /api/sales
```

**Response `200`**

```json
{
  "data": [
    {
      "id": "33333333-3333-3333-3333-333333333333",
      "total": "29.97",
      "soldAt": "2026-07-19T12:00:00.000Z",
      "createdAt": "2026-07-19T12:00:00.000Z",
      "updatedAt": "2026-07-19T12:00:00.000Z",
      "lines": [
        {
          "id": "44444444-4444-4444-4444-444444444444",
          "productId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "quantity": 3,
          "unitPrice": "9.99",
          "lineTotal": "29.97",
          "product": {
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "name": "USB Cable",
            "sku": "USB-01"
          }
        }
      ]
    }
  ]
}
```

Sorted by `soldAt` descending.

### Get sale

```http
GET /api/sales/:id
```

**Response `200`** — one sale with lines.  
**Response `404`** — not found.

### Create sale

```http
POST /api/sales
Content-Type: application/json
```

```json
{
  "soldAt": "2026-07-19T12:00:00.000Z",
  "lines": [
    {
      "productId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "quantity": 3,
      "unitPrice": 9.99
    }
  ]
}
```

| Field | Required | Rules |
|-------|----------|--------|
| `soldAt` | no | ISO date string; default = now |
| `lines` | yes | Non-empty array |
| `lines[].productId` | yes | Existing product UUID |
| `lines[].quantity` | yes | Positive integer |
| `lines[].unitPrice` | yes | `>= 0` |

Server computes `lineTotal`, `total`, and decrements stock.

**Response `201`** — created sale with lines.  
**Response `400`** — validation / unknown product / invalid date.  
**Response `409` `INSUFFICIENT_STOCK`**

```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock for \"USB Cable\" (have 2, need 3)"
  }
}
```

### Delete sale

```http
DELETE /api/sales/:id
```

Restores stock for all lines, then deletes the sale.

**Response `204`**  
**Response `404`** — not found.

---

## End-to-end example (curl)

Replace `BASE` and IDs as needed.

```bash
BASE=http://localhost:3030

# 1) Create product
curl -s -X POST "$BASE/api/products" \
  -H "Content-Type: application/json" \
  -d '{"name":"USB Cable","sku":"USB-01","unitPrice":9.99,"stock":0}'

# 2) Purchase stock (increases stock)
curl -s -X POST "$BASE/api/purchases" \
  -H "Content-Type: application/json" \
  -d '{
    "lines": [
      { "productId": "PRODUCT_UUID", "quantity": 20, "unitCost": 5.00 }
    ]
  }'

# 3) Sell units (decreases stock)
curl -s -X POST "$BASE/api/sales" \
  -H "Content-Type: application/json" \
  -d '{
    "lines": [
      { "productId": "PRODUCT_UUID", "quantity": 3, "unitPrice": 9.99 }
    ]
  }'

# 4) Check product stock
curl -s "$BASE/api/products/PRODUCT_UUID"
```

Typical flow after the above:

1. Product `stock` starts at `0`
2. Purchase `20` → stock `20`
3. Sale `3` → stock `17`

---

## JavaScript / fetch example

```js
const BASE = "http://localhost:3030";

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (res.status === 204) return null;

  const body = await res.json();
  if (!res.ok) throw Object.assign(new Error(body.error?.message || res.statusText), body.error);
  return body.data;
}

const product = await api("/api/products", {
  method: "POST",
  body: JSON.stringify({ name: "USB Cable", sku: "USB-01", unitPrice: 9.99 }),
});

await api("/api/purchases", {
  method: "POST",
  body: JSON.stringify({
    lines: [{ productId: product.id, quantity: 20, unitCost: 5 }],
  }),
});

const sale = await api("/api/sales", {
  method: "POST",
  body: JSON.stringify({
    lines: [{ productId: product.id, quantity: 2, unitPrice: 9.99 }],
  }),
});

console.log(sale.total); // "19.98"
```

---

## Endpoint cheat sheet

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness |
| `GET` | `/api/products` | List / search products |
| `POST` | `/api/products` | Create product |
| `GET` | `/api/products/:id` | Get product |
| `PATCH` | `/api/products/:id` | Update product |
| `DELETE` | `/api/products/:id` | Delete product |
| `GET` | `/api/purchases` | List purchases |
| `POST` | `/api/purchases` | Create purchase (+stock) |
| `GET` | `/api/purchases/:id` | Get purchase |
| `DELETE` | `/api/purchases/:id` | Delete purchase (−stock) |
| `GET` | `/api/sales` | List sales |
| `POST` | `/api/sales` | Create sale (−stock) |
| `GET` | `/api/sales/:id` | Get sale |
| `DELETE` | `/api/sales/:id` | Delete sale (+stock) |

---

## Data model (reference)

```text
products
  id, name, sku?, description?, unitPrice, stock, createdAt, updatedAt

purchases
  id, total, purchasedAt, createdAt, updatedAt
  └── purchase_lines
        id, purchaseId, productId, quantity, unitCost, lineTotal

sales
  id, total, soldAt, createdAt, updatedAt
  └── sale_lines
        id, saleId, productId, quantity, unitPrice, lineTotal
```

There are **no** update endpoints for purchases/sales. To correct a document: delete it (stock is reversed), then create a new one.
