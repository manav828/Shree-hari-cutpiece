import { brand } from "@/lib/brand";

export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function generateWhatsAppLink(productName: string, price: number): string {
  const message = encodeURIComponent(
    `Hi! I'm interested in ordering "${productName}" (${formatPrice(price)}/meter) from Shree Hari Cutpiece. Please share more details.`
  );
  return `https://wa.me/${brand.whatsappNumber}?text=${message}`;
}
