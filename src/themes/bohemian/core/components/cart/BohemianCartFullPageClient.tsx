"use client";

import Image from "next/image";
import { getThumbnailUrl } from "@/lib/imageOptimization";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Info, Leaf, Minus, Package, Plus, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { bohemianBodyFont, bohemianHeadingFont } from "@/themes/bohemian/components/layout/premiumFonts";
import { BOHEMIAN_SITE_CONTAINER } from "@/themes/bohemian/components/layout/siteStyles";

const SHIPPING_THRESHOLD = 999;
const SHIPPING_CHARGE = 99;
const ESTIMATED_TAX_RATE = 0.08;

function buildItemMeta(item: {
  selected_options?: Array<{ value_labels?: string[]; input_value?: string | number }>;
  selling_mode: "meter" | "piece";
}): string {
  const selected = (item.selected_options || [])
    .map((option) => {
      if (option.value_labels && option.value_labels.length > 0) {
        return option.value_labels.join(", ");
      }
      if (option.input_value !== undefined && option.input_value !== null) {
        return String(option.input_value);
      }
      return "";
    })
    .filter(Boolean)
    .slice(0, 2);

  if (selected.length > 0) {
    return selected.join(" | ");
  }

  return item.selling_mode === "piece" ? "Piece item" : "Per meter cut";
}

export default function BohemianCartFullPageClient() {
  const router = useRouter();
  const { items, totalPrice, removeFromCart, updateQuantity, setIsCartOpen } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoNotice, setPromoNotice] = useState("");

  useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  const { shippingAmount, estimatedTax, finalTotal } = useMemo(() => {
    const shipping = totalPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
    const tax = Math.round(totalPrice * ESTIMATED_TAX_RATE);
    return {
      shippingAmount: shipping,
      estimatedTax: tax,
      finalTotal: totalPrice + shipping + tax,
    };
  }, [totalPrice]);

  const itemCountLabel = `${items.length} ${items.length === 1 ? "item" : "items"} ready for your home`;

  function applyPromoCode() {
    if (!promoCode.trim()) {
      setPromoNotice("Enter a promo code to continue.");
      return;
    }
    setPromoNotice("Promo code verification happens securely during checkout.");
  }

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/shop");
  }

  return (
    <main className={`${bohemianBodyFont.className} bg-[#fcf9f4]`}>
      <section className={`${BOHEMIAN_SITE_CONTAINER} py-12 md:py-16 lg:py-20`}>
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6f645d] transition-colors hover:text-[#9f3f29]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <header className="mb-10 md:mb-12">
          <h1 className={`${bohemianHeadingFont.className} text-4xl font-semibold leading-[0.95] text-[#9f3f29] md:text-5xl`}>
            Your Curated Collection
          </h1>
          <p className="mt-2 text-sm italic text-[#5a6245]">{itemCountLabel}</p>
        </header>

        {items.length === 0 ? (
          <div className="rounded-2xl bg-[#f3eee7] p-8 text-center md:p-12">
            <h2 className={`${bohemianHeadingFont.className} text-3xl text-[#1c1c19]`}>Your collection is currently empty</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-[#5f544d]">
              Add pieces from the archive to build your cart. Every handcrafted item you pick appears here instantly.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-[#9f3f29] px-8 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#bf573f]"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <section className="lg:col-span-8">
              <div className="divide-y divide-[#dfcdc1]/45">
                {items.map((item) => (
                  <article key={item.id} className="py-6 md:py-7">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-6">
                      <div className="h-28 w-24 flex-shrink-0 overflow-hidden rounded-md bg-[#f0ede8] md:h-36 md:w-28">
                        <Image src={getThumbnailUrl(item.image)} alt={item.name} width={220} height={320} className="h-full w-full object-cover" />
                      </div>

                      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:gap-6">
                        <div>
                          <h2 className={`${bohemianHeadingFont.className} text-[29px] leading-[1.02] text-[#1c1c19]`}>
                            {item.name}
                          </h2>
                          <p className="mt-1 text-sm text-[#5a6245]">{buildItemMeta(item)}</p>
                          <div className="mt-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8f847d]">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="transition-colors hover:text-[#9f3f29]"
                            >
                              Remove
                            </button>
                            <span className="text-[#c9b6ab]">|</span>
                            <button
                              type="button"
                              onClick={() => setPromoNotice("Save for later is coming soon.")}
                              className="transition-colors hover:text-[#9f3f29]"
                            >
                              Save for Later
                            </button>
                          </div>
                        </div>

                        <div className="flex items-end justify-between md:flex-col md:items-end">
                          <div className="inline-flex items-center overflow-hidden rounded-md bg-[#f0ede8]">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.meters - 1)}
                              className="flex h-8 w-8 items-center justify-center text-[#6f645d] transition-colors hover:bg-[#e6dfd7] hover:text-[#9f3f29]"
                              aria-label={`Decrease quantity for ${item.name}`}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center text-sm font-semibold text-[#1c1c19]">{item.meters}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.meters + 1)}
                              className="flex h-8 w-8 items-center justify-center text-[#6f645d] transition-colors hover:bg-[#e6dfd7] hover:text-[#9f3f29]"
                              aria-label={`Increase quantity for ${item.name}`}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <p className={`${bohemianHeadingFont.className} mt-3 text-[34px] leading-none text-[#9f3f29] md:mt-4`}>
                            {formatPrice(item.price * item.meters)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <Link
                href="/shop"
                className="mt-8 flex items-center gap-3 rounded-md bg-[#f3eee7] px-5 py-4 text-[#7a6f68] transition hover:bg-[#efe7de]"
              >
                <ArrowRight className="h-4 w-4 text-[#9f3f29]" />
                <span className={`${bohemianHeadingFont.className} text-lg italic`}>Continue exploring our latest Collection</span>
              </Link>
            </section>

            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <div className="rounded-lg bg-[#f8f3ec] p-6 shadow-[0_12px_28px_rgba(44,26,17,0.06)] md:p-7">
                  <h3 className={`${bohemianHeadingFont.className} text-[34px] leading-[1.02] text-[#2a221d]`}>Order Summary</h3>

                  <div className="mt-6 space-y-3 text-sm text-[#6b6059]">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-[#1c1c19]">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Shipping</span>
                      <span className="font-semibold text-[#1c1c19]">{formatPrice(shippingAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Estimated Tax</span>
                      <span className="font-semibold text-[#1c1c19]">{formatPrice(estimatedTax)}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[#dfcdc1]/70 pt-4 text-lg">
                      <span className="font-semibold text-[#1c1c19]">Total</span>
                      <span className={`${bohemianHeadingFont.className} text-3xl leading-none text-[#9f3f29]`}>
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#9f3f29] px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#bf573f]"
                  >
                    Secure Checkout
                  </Link>

                  <div className="mt-6 space-y-3 border-t border-[#dfcdc1]/60 pt-5 text-sm text-[#6b6059]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#9f3f29]" />
                      <span>Secure SSL encrypted payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-[#5a6245]" />
                      <span>Sustainable, plastic-free packaging</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-[#5a6245]" />
                      <span>Carbon-neutral delivery available</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label htmlFor="cart-promo-code" className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7a6f68]">
                      Promo Code
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        id="cart-promo-code"
                        value={promoCode}
                        onChange={(event) => setPromoCode(event.target.value)}
                        placeholder="Enter code"
                        className="h-10 min-w-0 flex-1 rounded-md border border-[#ddcfc4] bg-[#fcf9f4] px-3 text-sm text-[#2a221d] placeholder:text-[#9d8f86] focus:border-[#9f3f29] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={applyPromoCode}
                        className="h-10 rounded-md border border-[#cfbdb2] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[#7a6f68] transition hover:bg-[#efe7de]"
                      >
                        Apply
                      </button>
                    </div>
                    {promoNotice ? <p className="mt-2 text-xs text-[#7a6f68]">{promoNotice}</p> : null}
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-lg bg-[#e9eedf] px-4 py-3 text-xs text-[#4f593b]">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>Shipping times may vary for handcrafted items. Typical delivery is 5 to 7 business days.</p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}