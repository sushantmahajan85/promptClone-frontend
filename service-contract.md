
## Base Contract

- **Base URL**: `https://<your-backend-domain>`
- **API prefix**: `/api`
- **Auth**: `Authorization: Bearer <jwt>` for protected routes
- **Common success shape**: `{ success: true, ... }`
- **Common error shape**: `{ success: false, message: string, code?: string }`
- **Validation error**: `400`  
  `{ success: false, message: "Validation error", errors: [{ field, message }] }`

---

## 1) Auth APIs (`/api/auth`)

### `POST /api/auth/register`
Create local account.

**Request**
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "StrongPass123"
}
```

**Success (201)**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": {
    "_id": "6815...",
    "email": "user@example.com",
    "name": "User Name",
    "authProvider": "local",
    "role": "buyer",
    "sellerStatus": "none",
    "createdAt": "2026-05-03T00:00:00.000Z",
    "updatedAt": "2026-05-03T00:00:00.000Z"
  }
}
```

---

### `POST /api/auth/login`
Local login.

**Request**
```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```

**Success (200)**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "_id": "6815...", "email": "user@example.com", "name": "User Name" }
}
```

**Google-only account (401)**
```json
{
  "success": false,
  "message": "This account uses Google sign-in. Please continue with Google."
}
```

---

### `GET /api/auth/google`
Starts Google OAuth redirect.

### `GET /api/auth/google/callback`
Handles Google callback and redirects frontend:
- success → `FRONTEND_URL/auth/callback?token=...`
- local-account conflict → `FRONTEND_URL/auth/error?message=account_exists_with_password`

---

### `GET /api/auth/me` (protected)
Current user (excludes `passwordHash`, `dodopaymentsMerchantId`).

**Success**
```json
{
  "success": true,
  "user": {
    "_id": "6815...",
    "email": "user@example.com",
    "name": "User Name",
    "role": "buyer"
  }
}
```

---

### `POST /api/auth/logout` (protected)
Stateless logout acknowledgment.

**Success**
```json
{ "success": true }
```

---

## 2) Listings APIs (`/api/listings`)

## Listing Model Contract (current)
Key fields returned/accepted:
- `_id`
- `listingHashId` (auto-generated, format like `0xA1B2C3D4`, unique)
- `title`
- `description`
- `shortDescription`
- `sellerId`
- `price` (integer cents)
- `pricingModel` (**only** `"one-time"`)
- `llmCompatibility` (`string[]`)
- `tags` (`string[]`)
- `verified` (`boolean`, admin-controlled)
- `fileUrl`
- `fileSizeBytes`
- `packageZipUrl`
- `packageManifest`
- `coverImageUrl`
- `status` (`draft|pending-review|active|suspended`)
- `averageRating`
- `reviewCount`
- timestamps

---

### `GET /api/listings`
Public listing search (active only), with pagination and sorting.

**Query params**
- `q` (optional): comma-separated terms; matched against:
  - `tags` (`$in`)
  - `title` (regex i)
  - `shortDescription` (regex i)
  - `description` (regex i)
- `sortBy`: `newest | price_asc | price_desc | top_rated` (default `newest`)
- `page` (default `1`)
- `limit` (default `20`, max `50`)

**Success**
```json
{
  "success": true,
  "listings": [
    {
      "_id": "6815...",
      "listingHashId": "0xA1B2C3D4",
      "title": "Vision Parser Pro",
      "shortDescription": "Parse structured images",
      "price": 4200,
      "pricingModel": "one-time",
      "tags": ["vision", "parser"],
      "verified": true,
      "sellerId": {
        "_id": "6814...",
        "name": "Synetix_Dev",
        "avatarUrl": "https://..."
      }
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

---

### `GET /api/listings/:id`
Public single listing.

**Success**
```json
{
  "success": true,
  "listing": {
    "_id": "6815...",
    "listingHashId": "0xA1B2C3D4",
    "title": "Vision Parser Pro",
    "description": "# Skill Documentation ...",
    "sellerId": {
      "_id": "6814...",
      "name": "Synetix_Dev",
      "avatarUrl": "https://...",
      "bio": "..."
    }
  }
}
```

---

### `POST /api/listings` (protected)
Create listing (seller must be active).

**Request**
```json
{
  "title": "Vision Parser Pro",
  "description": "# Skill Documentation",
  "shortDescription": "Parse structured images",
  "price": 4200,
  "pricingModel": "one-time",
  "llmCompatibility": ["openai", "anthropic"],
  "tags": ["vision", "parser"],
  "status": "draft"
}
```

**Verified rule**
- If body includes `verified` and requester is not admin → `403`

**Success (201)**
```json
{ "success": true, "listing": { "_id": "6815...", "listingHashId": "0xA1B2C3D4" } }
```

---

### `PATCH /api/listings/:id` (protected)
Update listing.

**Auth rules**
- Owner can update own listing fields
- Only admin can set `verified`
- Non-owner admin can update only `verified` for others

**Request example**
```json
{
  "shortDescription": "Updated",
  "tags": ["vision", "ocr"]
}
```

---

### `DELETE /api/listings/:id` (protected)
Soft delete by owner (`status = suspended`).

**Success**
```json
{ "success": true, "listing": { "_id": "6815...", "status": "suspended" } }
```

---

### `POST /api/listings/:id/upload` (protected, multipart)
Upload package/asset for listing owner.

**FormData fields**
- `skillFile` (file, optional)
- `coverImage` (file, optional)

### Behavior
- If `skillFile` is non-zip: upload as raw, set `fileUrl`, `fileSizeBytes`, clear package fields.
- If `skillFile` is zip:
  - zip uploaded as bundle (`packageZipUrl`, `fileUrl`)
  - extracted files uploaded individually
  - `packageManifest` stored with file list

### Zip constraints
- max zip size: **50MB**
- max uncompressed total: **100MB**
- max file count: **500**

**Success**
```json
{
  "success": true,
  "listing": {
    "_id": "6815...",
    "fileUrl": "https://...",
    "packageZipUrl": "https://...",
    "fileSizeBytes": 123456,
    "packageManifest": {
      "version": 1,
      "uploadedAt": "2026-05-03T00:00:00.000Z",
      "fileCount": 3,
      "totalUncompressedBytes": 99887,
      "files": [
        { "path": "skills.md", "url": "https://...", "bytes": 1200, "resourceType": "raw" },
        { "path": "handler.js", "url": "https://...", "bytes": 3600, "resourceType": "raw" }
      ]
    },
    "coverImageUrl": "https://..."
  }
}
```

---

## 3) Users APIs (`/api/users`)

### `GET /api/users/:id/public`
Public profile.

**Success**
```json
{
  "success": true,
  "user": {
    "name": "Synetix_Dev",
    "avatarUrl": "https://...",
    "bio": "...",
    "role": "seller",
    "createdAt": "2026-05-03T00:00:00.000Z"
  }
}
```

---

### `PATCH /api/users/me` (protected)
Update own profile.

**Request**
```json
{
  "name": "New Name",
  "bio": "Updated bio"
}
```

---

### `POST /api/users/me/become-seller` (protected)
Creates Dodo-side seller/customer account, stores `dodopaymentsMerchantId`, sets `sellerStatus=pending`.

**Success**
```json
{
  "success": true,
  "onboardingUrl": "https://..."
}
```

---

## 4) Payments APIs (`/api/payments`)

### `POST /api/payments/create-checkout` (protected)
Buyer checkout for listing.

**Request**
```json
{
  "listingId": "6815..."
}
```

**Behavior**
- listing must be active
- fee computed from `PLATFORM_FEE_PERCENT`
- pending transaction created

**Success**
```json
{
  "success": true,
  "checkoutUrl": "https://..."
}
```

---

### `POST /api/payments/webhook`
Dodo webhook endpoint (raw body route).

- Signature verified via Dodo SDK unwrap using:
  - `webhook-id`
  - `webhook-signature`
  - `webhook-timestamp`
- responds `200` quickly, processes async

**Handled events**
- `payment.succeeded` / `payment.success` → mark transaction completed
- `merchant.approved` → activate seller status

---

### `GET /api/payments/seller/dashboard` (protected)
Seller dashboard summary.

**Success**
```json
{
  "success": true,
  "totalEarnings": 123400,
  "pendingPayouts": 5600,
  "completedTransactions": [],
  "listingBreakdown": [
    {
      "listingId": "6815...",
      "title": "Vision Parser Pro",
      "totalSales": 12,
      "totalEarnings": 50400
    }
  ]
}
```

---

## 5) Utility Endpoint

### `GET /health`
Basic health response.

```json
{ "ok": true }
```
