type ImageQualityVariant = "heroDesktop" | "heroMobile" | "sectionCard";

const WIDTH_BY_VARIANT: Record<ImageQualityVariant, number> = {
  heroDesktop: 2400,
  heroMobile: 1600,
  sectionCard: 1800,
};

const QUALITY_BY_VARIANT: Record<ImageQualityVariant, number> = {
  heroDesktop: 90,
  heroMobile: 88,
  sectionCard: 86,
};

export function getHighQualityImageUrl(imageUrl: string, variant: ImageQualityVariant = "sectionCard"): string {
  const trimmed = imageUrl?.trim();
  if (!trimmed) return trimmed;

  try {
    const url = new URL(trimmed);
    const hostname = url.hostname.toLowerCase();

    if (hostname === "images.unsplash.com") {
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", String(WIDTH_BY_VARIANT[variant]));
      url.searchParams.set("q", String(QUALITY_BY_VARIANT[variant]));
      return url.toString();
    }

    if (hostname === "images.pexels.com") {
      url.searchParams.set("auto", "compress");
      url.searchParams.set("cs", "tinysrgb");
      url.searchParams.set("dpr", "2");
      url.searchParams.set("w", String(WIDTH_BY_VARIANT[variant]));
      return url.toString();
    }

    return url.toString();
  } catch {
    return trimmed;
  }
}
