const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApiUser = {
  _id: string;
  email: string;
  name: string;
  role: "buyer" | "seller" | "both" | "admin";
  sellerStatus?: "none" | "pending" | "active";
  avatarUrl?: string;
  bio?: string;
  authProvider?: "local" | "google";
  createdAt: string;
  updatedAt: string;
};

export type PackageManifestFile = {
  path: string;
  url: string;
  bytes: number;
  resourceType: string;
};

export type PackageManifest = {
  version: number;
  uploadedAt: string;
  fileCount: number;
  totalUncompressedBytes: number;
  files: PackageManifestFile[];
};

export type ListingStatus = "draft" | "pending-review" | "active" | "suspended";

export type DemoMediaItem = {
  url: string;
  resourceType: string;
  name: string;
};

export type ApiListing = {
  _id: string;
  listingHashId: string;
  title: string;
  description: string;
  shortDescription: string;
  price: number; // cents
  pricingModel: "one-time";
  llmCompatibility: string[];
  tags: string[];
  categories?: string[];
  verified: boolean;
  fileUrl?: string;
  fileSizeBytes?: number;
  packageZipUrl?: string;
  packageManifest?: PackageManifest;
  coverImageUrl?: string;
  demoMedia?: DemoMediaItem[];
  status: ListingStatus;
  averageRating?: number;
  reviewCount?: number;
  /** Backend taxonomy slug (e.g. `seo-growth`). */
  category?: string;
  /** Optional display label from backend; else UI maps `category` via explore categories. */
  categoryLabel?: string;
  /** Total purchases / installs for trust signals on cards. */
  purchaseCount?: number;
  featured?: boolean;
  sellerId: {
    _id: string;
    name: string;
    avatarUrl?: string;
    bio?: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type ListingsPage = {
  listings: ApiListing[];
  total: number;
  page: number;
  totalPages: number;
};

export type AuthPayload = {
  token: string;
  user: ApiUser;
};

export type SellerInviteRequestStatus = "pending" | "approved" | "rejected";

export type SellerInviteRequest = {
  _id: string;
  userId?: string | ApiUser;
  skillType: string;
  skillSummary: string;
  status: SellerInviteRequestStatus;
  adminNotes: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
};

export type ListingsSortBy =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "top_rated"
  | "popular";

export type ListingsQuery = {
  q?: string;
  sortBy?: ListingsSortBy;
  /** Filter by backend category slug. */
  category?: string;
  /** When true, backend uses semantic / natural-language matching for `q`. */
  semantic?: boolean;
  page?: number;
  limit?: number;
};

export type ListingCategoryOption = {
  slug: string;
  label: string;
};

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  opts: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {};

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: { ...headers, ...(opts.headers as Record<string, string>) },
  });

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message ?? `Request failed (${res.status})`);
  }
  return json as T;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  googleUrl: () => `${BASE_URL}/api/auth/google`,

  register(email: string, name: string, password: string) {
    return apiFetch<{ success: true } & AuthPayload>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, password }),
    });
  },

  login(email: string, password: string) {
    return apiFetch<{ success: true } & AuthPayload>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  me(token: string) {
    return apiFetch<{ success: true; user: ApiUser }>("/api/auth/me", {}, token);
  },

  logout(token: string) {
    return apiFetch<{ success: true }>("/api/auth/logout", { method: "POST" }, token);
  },
};

// ─── Listings API ─────────────────────────────────────────────────────────────

export const listingsApi = {
  list(params: ListingsQuery = {}) {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.sortBy) sp.set("sortBy", params.sortBy);
    if (params.category) sp.set("category", params.category);
    if (params.semantic) sp.set("semantic", "true");
    if (params.page != null) sp.set("page", String(params.page));
    if (params.limit != null) sp.set("limit", String(params.limit));
    const qs = sp.toString();
    return apiFetch<{ success: true } & ListingsPage>(
      `/api/listings${qs ? `?${qs}` : ""}`,
    );
  },

  get(id: string, token?: string) {
    return apiFetch<{ success: true; listing: ApiListing; transaction?: unknown }>(
      `/api/listings/${id}`,
      undefined,
      token,
    );
  },

  featured(limit = 6) {
    return apiFetch<{ success: true; listings: ApiListing[]; count: number }>(
      `/api/listings/featured?limit=${limit}`,
    );
  },

  /** Public category list for explore pills (optional; UI falls back if missing). */
  listCategories() {
    return apiFetch<{ success: true; categories: ListingCategoryOption[] }>(
      "/api/listings/categories",
    );
  },

  create(
    token: string,
    body: {
      title: string;
      description: string;
      shortDescription?: string;
      price: number;
      pricingModel: "one-time";
      llmCompatibility: string[];
      tags: string[];
      status: "draft";
      /** Explore taxonomy slugs; send 1–2 entries (backend may store primary + optional secondary). */
      categories?: string[];
    },
  ) {
    return apiFetch<{ success: true; listing: ApiListing }>(
      "/api/listings",
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
  },

  update(token: string, id: string, body: Record<string, unknown>) {
    return apiFetch<{ success: true; listing: ApiListing }>(
      `/api/listings/${id}`,
      { method: "PATCH", body: JSON.stringify(body) },
      token,
    );
  },

  upload(token: string, id: string, skillFile: File, coverImage?: File | null, demoMediaFiles?: File[]) {
    const form = new FormData();
    form.append("skillFile", skillFile);
    if (coverImage) form.append("coverImage", coverImage);
    if (demoMediaFiles) {
      for (const file of demoMediaFiles) {
        form.append("demoMedia", file);
      }
    }
    return apiFetch<{ success: true; listing: ApiListing }>(
      `/api/listings/${id}/upload`,
      { method: "POST", body: form },
      token,
    );
  },
};

// ─── Users API ────────────────────────────────────────────────────────────────

export const usersApi = {
  getPublic(id: string) {
    return apiFetch<{ success: true; user: ApiUser }>(`/api/users/${id}/public`);
  },

  updateMe(token: string, body: { name?: string; bio?: string }) {
    return apiFetch<{ success: true; user: ApiUser }>(
      "/api/users/me",
      { method: "PATCH", body: JSON.stringify(body) },
      token,
    );
  },

  becomeSeller(token: string, body: { skillType: string; skillSummary: string }) {
    return apiFetch<{ success: true; request: SellerInviteRequest }>(
      "/api/users/me/become-seller",
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
  },

  getMySellerInviteRequest(token: string) {
    return apiFetch<{ success: true; request: SellerInviteRequest }>(
      "/api/users/me/seller-invite-request",
      {},
      token,
    );
  },

  getMyPurchases(token: string) {
    return apiFetch<{ success: true; listings: ApiListing[] }>(
      "/api/users/me/purchases",
      {},
      token,
    );
  },

  getMyListings(token: string) {
    return apiFetch<{ success: true; listings: ApiListing[] }>(
      "/api/users/me/listings",
      {},
      token,
    );
  },
};

// ─── Payments API ─────────────────────────────────────────────────────────────

export type ApiTransaction = {
  _id: string;
  type: "purchase" | "withdrawal";
  listingId?: string;
  buyerId?: string;
  sellerId: string;
  amount: number;
  platformFee?: number;
  sellerPayout?: number;
  status: "pending" | "completed" | "refunded" | "failed";
  createdAt: string;
};

export type ApiWithdrawal = {
  _id: string;
  type: "withdrawal";
  sellerId: string;
  /** Amount in cents */
  amount: number;
  status: "pending" | "completed" | "failed";
  bankDetails?: Record<string, unknown>;
  createdAt: string;
};

export const paymentsApi = {
  createCheckout(token: string, listingId: string) {
    return apiFetch<{
      success: true;
      order_id: string;
      amount: number;
      currency: string;
      key_id: string;
    }>(
      "/api/payments/create-checkout",
      { method: "POST", body: JSON.stringify({ listingId }) },
      token,
    );
  },

  verifyPayment(
    token: string,
    body: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    },
  ) {
    return apiFetch<{ success: true; transaction: ApiTransaction }>(
      "/api/payments/verify-payment",
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
  },

  sellerDashboard(token: string) {
    return apiFetch<{
      success: true;
      totalEarnings: number;
      pendingPayouts: number;
      completedTransactions: ApiTransaction[];
      listingBreakdown: {
        listingId: string;
        title: string;
        totalSales: number;
        totalEarnings: number;
      }[];
      withdrawalHistory: ApiWithdrawal[];
    }>("/api/payments/seller/dashboard", {}, token);
  },

  withdraw(token: string, amountCents: number, bankDetails?: Record<string, unknown>) {
    return apiFetch<{ success: true; withdrawal: { _id: string; amount: number; status: string; createdAt: string } }>(
      "/api/payments/withdraw",
      { method: "POST", body: JSON.stringify({ amount: amountCents, bankDetails: bankDetails ?? {} }) },
      token,
    );
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatBytes(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function sellerInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

/**
 * Decode a JWT payload without network calls or signature verification.
 * Used as a lightweight fallback when the API is unreachable.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replaceAll("-", "+").replaceAll("_", "/");
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Build a minimal ApiUser from a decoded JWT payload.
 * The JWT contains userId, email, role — name is derived from email.
 */
export function userFromJwt(token: string): ApiUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const email = (payload.email as string) ?? "";
  const userId = (payload.userId as string) ?? (payload.sub as string) ?? "";
  const role = (payload.role as ApiUser["role"]) ?? "buyer";
  const now = new Date().toISOString();

  return {
    _id: userId,
    email,
    name: email.split("@")[0] ?? "User",
    role,
    createdAt: now,
    updatedAt: now,
  };
}

/** Returns true if the JWT has not expired yet. */
export function isJwtValid(token: string): boolean {
  try {
    const payload = decodeJwtPayload(token);
    if (!payload) return false;
    const exp = payload.exp as number | undefined;
    if (!exp) return true; // no expiry field — treat as valid
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
}
