## Service contract: featured listings (landing)

### `GET /api/listings/featured`

Public endpoint that returns **active** listings marked **`featured: true`**, ordered by **`createdAt` descending** (newest first).

| Item | Detail |
|------|--------|
| **Base** | Same origin as your API (e.g. `https://api.example.com`); path is **`/api/listings/featured`** |
| **Auth** | None |
| **Headers** | No special headers required |

#### Query parameters

| Name | Type | Required | Default | Constraints |
|------|------|----------|---------|-------------|
| `limit` | integer | No | `6` | Parsed as base-10 integer; invalid/missing non-numeric values fall back to **6**; clamped to **1–24** |

#### Success response

- **Status:** `200 OK`
- **Body:** JSON

```json
{
  "success": true,
  "listings": [ /* Listing[] */ ],
  "count": 0
}
```

- **`count`:** number of objects in **`listings`** for this response (not total in DB).

#### `listings[]` item (Mongoose document shape)

Typical fields (all listing fields are returned unless you later add `.select()`). Relevant ones for the UI:

| Field | Type | Notes |
|-------|------|--------|
| `_id` | string (ObjectId) | Listing id |
| `title` | string | |
| `description` | string | |
| `shortDescription` | string | |
| `sellerId` | object | **Populated:** `{ "_id", "name", "avatarUrl" }` (not a bare id string) |
| `price` | number | Integer **cents** (project convention) |
| `pricingModel` | string | `"one-time"` |
| `llmCompatibility` | string[] | |
| `fileUrl` | string \| null | |
| `listingHashId` | string | e.g. `0x` + hex |
| `fileSizeBytes` | number | |
| `packageZipUrl` | string \| null | |
| `packageManifest` | object \| null | Arbitrary structure when present |
| `coverImageUrl` | string \| null | |
| `tags` | string[] | |
| `verified` | boolean | |
| `featured` | boolean | Always `true` in this response |
| `status` | string | Always `"active"` in this response |
| `averageRating` | number | |
| `reviewCount` | number | |
| `createdAt` | string (ISO date) | From `timestamps` |
| `updatedAt` | string (ISO date) | From `timestamps` |

Empty result: **`success: true`**, **`listings: []`**, **`count: 0`**.

#### Error response (global handler)

On failure, responses use:

```json
{
  "success": false,
  "message": "…"
}
```

Optional **`code`** if the error object carries one. **`status`** is usually **`500`** unless something else sets **`err.status`**.

---

**Related (not this route):** marking a listing as featured is done by an **admin** via **`PATCH /api/listings/:id`** with `{ "featured": true }` (authenticated); that is the write side of the same `featured` flag.