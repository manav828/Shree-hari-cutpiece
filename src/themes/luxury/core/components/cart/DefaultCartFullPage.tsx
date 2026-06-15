"use client";

import Image from "next/image";
import { getThumbnailUrl } from "@/lib/imageOptimization";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/components/cart/CartSidebar";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

const SHIPPING_THRESHOLD = 999;
const SHIPPING_CHARGE = 99;

function buildItemMeta(item: {
  selected_options?: Array<{ group_name: string; value_labels?: string[]; input_value?: string | number }>;
  selling_mode: "meter" | "piece";
}): string {
  const optionPreview = (item.selected_options || [])
    .map((option) => {
      const value = option.value_labels?.join(", ") || (option.input_value !== undefined ? String(option.input_value) : "");
      return value ? `${option.group_name}: ${value}` : "";
    })
    .filter(Boolean)
    .slice(0, 2);

  if (optionPreview.length > 0) {
    return optionPreview.join(" | ");
  }

  return item.selling_mode === "piece" ? "Sold per piece" : "Sold per meter";
}

export default function DefaultCartFullPage() {
  const router = useRouter();
  const { items, totalPrice, updateQuantity, removeFromCart, setIsCartOpen } = useCart();

  useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/shop");
  }

  const shippingAmount = totalPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  const finalTotal = totalPrice + shippingAmount;

  return (
    <>
      <Navbar />
      <CartSidebar />

      <main className="bg-[#F9F6F1] py-12 lg:py-16 min-h-[70vh]">
        <Container>
          <button
            type="button"
            onClick={handleBack}
            className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <header className="mb-10">
            <h1 className="font-serif text-4xl text-foreground">Your Cart</h1>
            <p className="mt-2 text-sm text-text-secondary">{items.length} {items.length === 1 ? "item" : "items"} selected</p>
          </header>

          {items.length === 0 ? (
            <section className="rounded-2xl border border-border/70 bg-white p-10 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-text-secondary" />
              <h2 className="mt-4 font-serif text-3xl text-foreground">Your cart is empty</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-text-secondary">
                Start exploring fabrics to add your favorite pieces and continue to checkout.
              </p>
              <Link href="/shop" className="btn-primary mt-7">
                Continue Shopping
              </Link>
            </section>
          ) : (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
              <section className="lg:col-span-8 rounded-2xl border border-border/60 bg-white">
                <div className="divide-y divide-border/60 px-5 sm:px-8">
                  {items.map((item) => (
                    <article key={item.id} className="py-6 sm:py-7">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="relative h-32 w-24 overflow-hidden rounded-md bg-background-secondary sm:h-36 sm:w-28">
                          <Image src={getThumbnailUrl(item.image)} alt={item.name} fill className="object-cover" />
                        </div>

                        <div className="grid flex-1 gap-4 sm:grid-cols-[1fr_auto]">
                          <div>
                            <h2 className="font-medium text-xl text-foreground">{item.name}</h2>
                            <p className="mt-1 text-sm text-text-secondary">{buildItemMeta(item)}</p>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-text-secondary transition-colors hover:text-accent"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </button>
                          </div>

                          <div className="flex items-end justify-between sm:flex-col sm:items-end">
                            {(() => {
                              const isMeter = item.selling_mode === "meter";
                              const step = isMeter ? 0.5 : 1;
                              const minVal = isMeter ? 0.5 : 1;
                              const isMin = item.meters <= minVal;
                              return (
                                <div className="inline-flex items-center overflow-hidden rounded-md border border-border bg-background">
                                  <button
                                    type="button"
                                    disabled={isMin}
                                    onClick={() => {
                                      if (!isMin) {
                                        const nextVal = parseFloat((item.meters - step).toFixed(1));
                                        updateQuantity(item.id, Math.max(minVal, nextVal));
                                      }
                                    }}
                                    className={`flex h-8 w-8 items-center justify-center text-text-secondary transition-colors hover:bg-background-secondary hover:text-foreground ${
                                      isMin ? "opacity-30 cursor-not-allowed hover:bg-transparent" : ""
                                    }`}
                                    aria-label={`Decrease quantity for ${item.name}`}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="w-12 text-center text-sm font-semibold text-foreground">
                                    {item.meters.toFixed(isMeter ? 1 : 0).replace(/\.0$/, "")}
                                    {isMeter ? "m" : ""}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextVal = parseFloat((item.meters + step).toFixed(1));
                                      updateQuantity(item.id, nextVal);
                                    }}
                                    className="flex h-8 w-8 items-center justify-center text-text-secondary transition-colors hover:bg-background-secondary hover:text-foreground"
                                    aria-label={`Increase quantity for ${item.name}`}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              );
                            })()}
                            <p className="mt-3 text-lg font-semibold text-foreground">{formatPrice(item.price * item.meters)}</p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="border-t border-border/60 bg-background-secondary/45 px-5 py-4 sm:px-8">
                  <Link href="/shop" className="text-sm text-text-secondary transition-colors hover:text-accent">
                    Continue Shopping
                  </Link>
                </div>
              </section>

              <aside className="lg:col-span-4">
                <div className="rounded-2xl border border-border/60 bg-white p-6 lg:sticky lg:top-28">
                  <h3 className="font-serif text-2xl text-foreground">Order Summary</h3>

                  <div className="mt-6 space-y-3 text-sm text-text-secondary">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-foreground">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Shipping</span>
                      <span className="font-medium text-foreground">{formatPrice(shippingAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/70 pt-3 text-base">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="font-semibold text-foreground">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  <Link href="/checkout" className="btn-primary mt-6 w-full">
                    Proceed to Checkout
                  </Link>

                  <p className="mt-3 text-xs text-text-secondary">Shipping and taxes are finalized during checkout.</p>
                </div>
              </aside>
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </>
  );
}