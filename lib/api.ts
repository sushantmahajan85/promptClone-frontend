const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApiUser = {
  _id: string;
  email: string;
  name: string;
  role: "buyer" | "seller" | "admin";
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
  verified: boolean;
  fileUrl?: string;
  fileSizeBytes?: number;
  packageZipUrl?: string;
  packageManifest?: PackageManifest;
  coverImageUrl?: string;
  status: ListingStatus;
  averageRating?: number;
  reviewCount?: number;
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

export type ListingsQuery = {
  q?: string;
  sortBy?: "newest" | "price_asc" | "price_desc" | "top_rated";
  page?: number;
  limit?: number;
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

  upload(token: string, id: string, skillFile: File, coverImage?: File) {
    const form = new FormData();
    form.append("skillFile", skillFile);
    if (coverImage) form.append("coverImage", coverImage);
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

  becomeSeller(token: string) {
    return apiFetch<{ success: true; onboardingUrl: string }>(
      "/api/users/me/become-seller",
      { method: "POST" },
      token,
    );
  },
};

// ─── Payments API ─────────────────────────────────────────────────────────────

export const paymentsApi = {
  createCheckout(token: string, listingId: string) {
    return apiFetch<{ success: true; checkoutUrl: string }>(
      "/api/payments/create-checkout",
      { method: "POST", body: JSON.stringify({ listingId }) },
      token,
    );
  },

  sellerDashboard(token: string) {
    return apiFetch<{
      success: true;
      totalEarnings: number;
      pendingPayouts: number;
      completedTransactions: unknown[];
      listingBreakdown: {
        listingId: string;
        title: string;
        totalSales: number;
        totalEarnings: number;
      }[];
    }>("/api/payments/seller/dashboard", {}, token);
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
