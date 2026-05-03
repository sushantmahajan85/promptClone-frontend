import type { ApiListing, PackageManifestFile } from "@/lib/api";

function isVideoFile(file: PackageManifestFile): boolean {
  return (
    file.resourceType.startsWith("video/") ||
    /\.(mp4|webm|mov|m4v|ogg)$/i.test(file.path)
  );
}

function isImageFile(file: PackageManifestFile): boolean {
  return (
    file.resourceType.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|svg)$/i.test(file.path)
  );
}

/** First demo video in the package manifest (for cards / previews). */
export function getFirstDemoVideo(listing: ApiListing): PackageManifestFile | null {
  const files = listing.packageManifest?.files ?? [];
  return files.find((f) => isVideoFile(f)) ?? null;
}

/** Best thumbnail URL: cover image, else first demo image in manifest. */
export function getListingThumbnailUrl(listing: ApiListing): string | null {
  if (listing.coverImageUrl) return listing.coverImageUrl;
  const files = listing.packageManifest?.files ?? [];
  const img = files.find((f) => isImageFile(f));
  return img?.url ?? null;
}
