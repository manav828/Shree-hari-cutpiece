"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CreditCard,
  Landmark,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { bohemianBodyFont, bohemianHeadingFont } from "@/themes/bohemian/components/layout/premiumFonts";
import { BOHEMIAN_SITE_CONTAINER } from "@/themes/bohemian/components/layout/siteStyles";

type CheckoutCartItem = {
  id: string;
  product_id?: string;
  variant_id?: string;
  name: string;
  image: string;
  price: number;
  meters: number;
  selling_mode: "meter" | "piece";
  selected_options?: Array<{
    group_name?: string;
    value_labels?: string[];
    input_value?: string | number;
  }>;
};

type CheckoutFormData = {
  fullName: string;
  addressLine1: string;
  area: string;
  landmark: string;
  city: string;
  pincode: string;
  state: string;
  phone: string;
  email: string;
  notes: string;
};

type PaymentOptionId = "upi" | "card" | "netbanking";

type StartPaymentResponse = {
  success?: boolean;
  internalOrderId?: string;
  orderNumber?: string;
  razorpayOrderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  error?: string;
};

type VerifyPaymentResponse = {
  success?: boolean;
  error?: string;
};

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    description?: string;
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color: string;
  };
  method?: {
    upi?: boolean;
    card?: boolean;
    netbanking?: boolean;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: RazorpayHandlerResponse) => void | Promise<void>;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", callback: (response: RazorpayFailureResponse) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const SHIPPING_THRESHOLD = 999;
const SHIPPING_CHARGE = 99;
const GST_RATE = 0.18;

const paymentOptions: Array<{
  id: PaymentOptionId;
  label: string;
  subtitle: string;
  icon: typeof Smartphone;
}> = [
  {
    id: "upi",
    label: "UPI",
    subtitle: "Google Pay, PhonePe, Paytm",
    icon: Smartphone,
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    subtitle: "Visa, Mastercard, RuPay, Amex",
    icon: CreditCard,
  },
  {
    id: "netbanking",
    label: "Net Banking",
    subtitle: "All major Indian banks",
    icon: Landmark,
  },
];

const indianStates = [
  "Andhra Pradesh",
  "Delhi",
  "Gujarat",
  "Karnataka",
  "Maharashtra",
  "Rajasthan",
  "Tamil Nadu",
  "Uttar Pradesh",
  "West Bengal",
];

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function getMethodConfig(method: PaymentOptionId): RazorpayOptions["method"] {
  if (method === "upi") {
    return { upi: true };
  }
  if (method === "card") {
    return { card: true };
  }
  return { netbanking: true };
}

function formatItemMeta(item: CheckoutCartItem): string {
  const selected = (item.selected_options || [])
    .map((opt) => {
      if (opt.value_labels && opt.value_labels.length > 0) {
        return opt.value_labels.join(", ");
      }
      if (opt.input_value !== undefined && opt.input_value !== null) {
        return String(opt.input_value);
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

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart, setIsCartOpen } = useCart();
  const { user, isLoading } = useAuth();

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    addressLine1: "",
    area: "",
    landmark: "",
    city: "",
    pincode: "",
    state: "Maharashtra",
    phone: "",
    email: "",
    notes: "",
  });
  const [selectedPayment, setSelectedPayment] = useState<PaymentOptionId>("upi");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderReference, setOrderReference] = useState("");

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [],
  );

  useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  const subtotal = totalPrice;
  const shippingAmount = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  const gstAmount = Math.round(subtotal * GST_RATE);
  const finalTotal = subtotal + shippingAmount + gstAmount;

  function handleFieldChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function getMissingFieldMessage(): string | null {
    const requiredFields: Array<{ key: keyof CheckoutFormData; label: string }> = [
      { key: "fullName", label: "Full Name" },
      { key: "addressLine1", label: "Street Address" },
      { key: "area", label: "Area / Locality" },
      { key: "city", label: "City" },
      { key: "pincode", label: "Pincode" },
      { key: "state", label: "State" },
      { key: "phone", label: "Phone Number" },
    ];

    const missing = requiredFields.find((field) => !String(formData[field.key] || "").trim());
    if (!missing) {
      return null;
    }

    return `${missing.label} is required.`;
  }

  async function handlePlaceOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMsg("");

    if (!user) {
      setErrorMsg("Please sign in to continue checkout.");
      setTimeout(() => router.push("/login"), 1200);
      return;
    }

    if (items.length === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    const missingFieldMessage = getMissingFieldMessage();
    if (missingFieldMessage) {
      setErrorMsg(missingFieldMessage);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    if (!accessToken) {
      setErrorMsg("Your session has expired. Please sign in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const createRes = await fetch("/api/checkout/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          formData,
          items,
        }),
      });

      const createJson = (await createRes.json()) as StartPaymentResponse;
      if (!createRes.ok || !createJson.success || !createJson.razorpayOrderId || !createJson.keyId || !createJson.internalOrderId) {
        throw new Error(createJson.error || "Unable to initialize Razorpay payment.");
      }

      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded || !window.Razorpay) {
        throw new Error("Razorpay checkout failed to load. Please check your network and retry.");
      }

      const razorpayOptions: RazorpayOptions = {
        key: createJson.keyId,
        amount: createJson.amount || Math.round(finalTotal * 100),
        currency: createJson.currency || "INR",
        name: "The Artisanal Archive",
        description: `Secure Checkout ${createJson.orderNumber ? `(${createJson.orderNumber})` : ""}`,
        order_id: createJson.razorpayOrderId,
        prefill: {
          name: formData.fullName,
          email: formData.email || user.email || "",
          contact: formData.phone,
        },
        notes: {
          internal_order_id: createJson.internalOrderId,
          order_number: createJson.orderNumber || "",
          selected_method: selectedPayment,
        },
        method: getMethodConfig(selectedPayment),
        theme: {
          color: "#9f3f29",
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            setErrorMsg("Payment was cancelled. You can retry from checkout.");
          },
        },
        handler: async (response: RazorpayHandlerResponse) => {
          try {
            const verifyRes = await fetch("/api/checkout/razorpay/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                internalOrderId: createJson.internalOrderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyJson = (await verifyRes.json()) as VerifyPaymentResponse;
            if (!verifyRes.ok || !verifyJson.success) {
              throw new Error(verifyJson.error || "Payment verification failed.");
            }

            clearCart();
            setOrderReference(createJson.orderNumber || "");
            setIsSuccess(true);
            setIsSubmitting(false);
          } catch (verifyError: unknown) {
            setIsSubmitting(false);
            setErrorMsg(verifyError instanceof Error ? verifyError.message : "Payment verification failed.");
          }
        },
      };

      const razorpayInstance = new window.Razorpay(razorpayOptions);
      razorpayInstance.on("payment.failed", (failureResponse: RazorpayFailureResponse) => {
        setIsSubmitting(false);
        setErrorMsg(failureResponse.error?.description || "Payment failed. Please retry.");
      });
      razorpayInstance.open();
    } catch (startPaymentError: unknown) {
      setIsSubmitting(false);
      setErrorMsg(startPaymentError instanceof Error ? startPaymentError.message : "Unable to start payment.");
    }
  }

  if (items.length === 0 && !isSuccess) {
    return (
      <div className={`${bohemianBodyFont.className} min-h-screen bg-[#fcf9f4] text-[#1c1c19]`}>
        <header className="fixed top-0 z-40 w-full border-b border-[#ece3dc] bg-[#fcf9f4]/95 backdrop-blur">
          <div className={`${BOHEMIAN_SITE_CONTAINER} flex h-20 items-center justify-between`}>
            <Link href="/" className={`${bohemianHeadingFont.className} text-3xl italic text-[#9f3f29]`}>
              The Artisanal Archive
            </Link>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7a6f68]">
              <Lock className="h-4 w-4" />
              Secure Checkout
            </div>
          </div>
        </header>

        <main className="pt-32">
          <section className={`${BOHEMIAN_SITE_CONTAINER} pb-20`}>
            <div className="rounded-2xl bg-[#f4efe8] p-10 text-center md:p-14">
              <h1 className={`${bohemianHeadingFont.className} text-4xl text-[#1c1c19] md:text-5xl`}>Your cart is empty</h1>
              <p className="mx-auto mt-3 max-w-xl text-sm text-[#6f645d]">
                Add handcrafted products to your cart before proceeding to secure Razorpay checkout.
              </p>
              <Link
                href="/shop"
                className="mt-8 inline-flex items-center justify-center rounded-lg bg-[#9f3f29] px-8 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#bf573f]"
              >
                Continue Shopping
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={`${bohemianBodyFont.className} min-h-screen bg-[#fcf9f4] text-[#1c1c19]`}>
        <header className="fixed top-0 z-40 w-full border-b border-[#ece3dc] bg-[#fcf9f4]/95 backdrop-blur">
          <div className={`${BOHEMIAN_SITE_CONTAINER} flex h-20 items-center justify-between`}>
            <Link href="/" className={`${bohemianHeadingFont.className} text-3xl italic text-[#9f3f29]`}>
              The Artisanal Archive
            </Link>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7a6f68]">
              <Lock className="h-4 w-4" />
              Secure Checkout
            </div>
          </div>
        </header>

        <main className="pt-32">
          <section className={`${BOHEMIAN_SITE_CONTAINER} pb-20`}>
            <div className="mx-auto max-w-2xl rounded-2xl bg-[#f4efe8] p-10 text-center md:p-14">
              <h1 className={`${bohemianHeadingFont.className} text-4xl text-[#1c1c19] md:text-5xl`}>Payment Successful</h1>
              <p className="mt-3 text-sm text-[#6f645d]">
                Your order is confirmed and payment has been verified through Razorpay.
              </p>
              {orderReference ? (
                <p className="mt-2 text-sm font-semibold text-[#9f3f29]">Order Ref: {orderReference}</p>
              ) : null}
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/account/orders"
                  className="inline-flex min-w-[180px] items-center justify-center rounded-lg bg-[#9f3f29] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#bf573f]"
                >
                  View Orders
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex min-w-[180px] items-center justify-center rounded-lg border border-[#cdb9ad] bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#1c1c19] transition hover:bg-[#efe7de]"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={`${bohemianBodyFont.className} min-h-screen bg-[#fcf9f4] text-[#1c1c19]`}>
      <header className="fixed top-0 z-40 w-full border-b border-[#ece3dc] bg-[#fcf9f4]/95 backdrop-blur">
        <div className={`${BOHEMIAN_SITE_CONTAINER} flex h-20 items-center justify-between`}>
          <Link href="/" className={`${bohemianHeadingFont.className} text-3xl italic text-[#9f3f29]`}>
            The Artisanal Archive
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7a6f68]">
            <Lock className="h-4 w-4" />
            Secure Checkout
          </div>
        </div>
      </header>

      <main className="pb-20 pt-28">
        <form onSubmit={handlePlaceOrder}>
          <div className={`${BOHEMIAN_SITE_CONTAINER} grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10`}>
            <section className="lg:col-span-8">
              <nav aria-label="Checkout Steps" className="mb-10 flex flex-wrap items-center gap-5 text-[#5f544d]">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9f3f29] text-xs font-semibold text-white">1</span>
                  <span className={`${bohemianHeadingFont.className} text-2xl text-[#1c1c19]`}>Shipping</span>
                </div>
                <span className="h-px w-10 bg-[#ddcfc4]" />
                <div className="flex items-center gap-3 opacity-45">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ebe8e3] text-xs font-semibold text-[#7a6f68]">2</span>
                  <span className={`${bohemianHeadingFont.className} text-2xl`}>Payment</span>
                </div>
                <span className="h-px w-10 bg-[#ddcfc4]" />
                <div className="flex items-center gap-3 opacity-45">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ebe8e3] text-xs font-semibold text-[#7a6f68]">3</span>
                  <span className={`${bohemianHeadingFont.className} text-2xl`}>Review</span>
                </div>
              </nav>

              {errorMsg ? (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              ) : null}

              {!user && !isLoading ? (
                <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Please sign in before payment. We will redirect you if you continue.
                </div>
              ) : null}

              <section className="rounded-xl bg-[#f6f3ee] p-6 md:p-8">
                <h2 className={`${bohemianHeadingFont.className} text-4xl text-[#1c1c19] md:text-[42px]`}>Shipping Information</h2>

                <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="md:col-span-2">
                    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7c74]">Full Name</span>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleFieldChange}
                      className="h-11 w-full rounded-lg border-none bg-[#ebe8e3] px-4 text-sm text-[#1c1c19] focus:outline-none focus:ring-1 focus:ring-[#9f3f29]"
                      placeholder="Arjun Sharma"
                    />
                  </label>

                  <label className="md:col-span-2">
                    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7c74]">Street Address / House No.</span>
                    <input
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleFieldChange}
                      className="h-11 w-full rounded-lg border-none bg-[#ebe8e3] px-4 text-sm text-[#1c1c19] focus:outline-none focus:ring-1 focus:ring-[#9f3f29]"
                      placeholder="Flat 402, Lotus Apartments"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7c74]">Area / Locality</span>
                    <input
                      name="area"
                      value={formData.area}
                      onChange={handleFieldChange}
                      className="h-11 w-full rounded-lg border-none bg-[#ebe8e3] px-4 text-sm text-[#1c1c19] focus:outline-none focus:ring-1 focus:ring-[#9f3f29]"
                      placeholder="Bandra West"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7c74]">Landmark (Optional)</span>
                    <input
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleFieldChange}
                      className="h-11 w-full rounded-lg border-none bg-[#ebe8e3] px-4 text-sm text-[#1c1c19] focus:outline-none focus:ring-1 focus:ring-[#9f3f29]"
                      placeholder="Near Mount Mary Church"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7c74]">City</span>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleFieldChange}
                      className="h-11 w-full rounded-lg border-none bg-[#ebe8e3] px-4 text-sm text-[#1c1c19] focus:outline-none focus:ring-1 focus:ring-[#9f3f29]"
                      placeholder="Mumbai"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7c74]">Pincode</span>
                    <input
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleFieldChange}
                      className="h-11 w-full rounded-lg border-none bg-[#ebe8e3] px-4 text-sm text-[#1c1c19] focus:outline-none focus:ring-1 focus:ring-[#9f3f29]"
                      placeholder="400050"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7c74]">State</span>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleFieldChange}
                      className="h-11 w-full rounded-lg border-none bg-[#ebe8e3] px-4 text-sm text-[#1c1c19] focus:outline-none focus:ring-1 focus:ring-[#9f3f29]"
                    >
                      {indianStates.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7c74]">Phone Number</span>
                    <div className="flex overflow-hidden rounded-lg">
                      <span className="inline-flex h-11 items-center bg-[#ddd7d2] px-3 text-xs text-[#6f645d]">+91</span>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleFieldChange}
                        className="h-11 w-full border-none bg-[#ebe8e3] px-4 text-sm text-[#1c1c19] focus:outline-none focus:ring-1 focus:ring-[#9f3f29]"
                        placeholder="98765 43210"
                      />
                    </div>
                  </label>

                  <label className="md:col-span-2">
                    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7c74]">Email (Optional)</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFieldChange}
                      className="h-11 w-full rounded-lg border-none bg-[#ebe8e3] px-4 text-sm text-[#1c1c19] focus:outline-none focus:ring-1 focus:ring-[#9f3f29]"
                      placeholder="name@email.com"
                    />
                  </label>
                </div>
              </section>

              <section className="mt-8 rounded-xl bg-[#f6f3ee] p-6 md:p-8">
                <div className="flex items-end justify-between gap-4">
                  <h2 className={`${bohemianHeadingFont.className} text-4xl text-[#1c1c19] md:text-[42px]`}>Payment Method</h2>
                  <p className="text-[11px] uppercase tracking-[0.1em] text-[#8a7c74]">Powered by Razorpay</p>
                </div>

                <div className="mt-6 space-y-3">
                  {paymentOptions.map((option) => {
                    const selected = selectedPayment === option.id;
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedPayment(option.id)}
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left transition-colors ${
                          selected
                            ? "border-[#9f3f29] bg-white"
                            : "border-transparent bg-[#ece7e1] hover:border-[#d4c2b8]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-4 w-4 rounded-full border ${selected ? "border-[#9f3f29]" : "border-[#9f8f86]"}`}
                          >
                            {selected ? <span className="mx-auto mt-[3px] block h-2 w-2 rounded-full bg-[#9f3f29]" /> : null}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[#1c1c19]">{option.label}</p>
                            <p className="text-xs text-[#7a6f68]">{option.subtitle}</p>
                          </div>
                        </div>
                        <Icon className="h-4 w-4 text-[#6f645d]" />
                      </button>
                    );
                  })}
                </div>
              </section>
            </section>

            <aside className="lg:col-span-4">
              <div className="rounded-xl bg-[#f0ece7] p-6 lg:sticky lg:top-28">
                <h3 className={`${bohemianHeadingFont.className} text-4xl text-[#1c1c19]`}>Order Summary</h3>

                <div className="mt-5 space-y-4">
                  {items.map((item) => (
                    <article key={item.id} className="flex gap-3">
                      <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#dfd8d1]">
                        <Image src={item.image} alt={item.name} width={140} height={180} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#1c1c19]">{item.name}</h4>
                        <p className="mt-0.5 text-[11px] text-[#7a6f68]">Quantity: {item.meters}</p>
                        <p className="mt-0.5 text-[11px] text-[#7a6f68]">{formatItemMeta(item as CheckoutCartItem)}</p>
                        <p className="mt-1 text-sm font-semibold text-[#9f3f29]">{currencyFormatter.format(item.price * item.meters)}</p>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-6 space-y-2 border-y border-[#dccfc4]/70 py-5 text-sm text-[#6f645d]">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#1c1c19]">{currencyFormatter.format(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span className="text-[#1c1c19]">{shippingAmount === 0 ? "Free" : currencyFormatter.format(shippingAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GST (18%)</span>
                    <span className="text-[#1c1c19]">{currencyFormatter.format(gstAmount)}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className={`${bohemianHeadingFont.className} text-3xl text-[#1c1c19]`}>Total</span>
                  <span className={`${bohemianHeadingFont.className} text-4xl text-[#9f3f29]`}>{currencyFormatter.format(finalTotal)}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#9f3f29] px-4 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#bf573f] disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing Payment...
                    </span>
                  ) : (
                    "Place Order & Pay"
                  )}
                </button>

                <p className="mt-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[#7a6f68]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  100% Secure Transaction
                </p>
              </div>
            </aside>
          </div>
        </form>
      </main>

      <footer className="border-t border-[#eee4dd]/80 bg-[#fcf9f4] py-10">
        <div className={`${BOHEMIAN_SITE_CONTAINER} flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left`}>
          <p className={`${bohemianHeadingFont.className} text-2xl text-[#1c1c19]`}>The Artisanal Archive</p>
          <p className="text-xs text-[#8a7c74]">© 2026 The Artisanal Archive. Curating warmth for the modern home.</p>
          <div className="flex items-center gap-5 text-xs text-[#8a7c74]">
            <Link href="/privacy-policy" className="transition-colors hover:text-[#1c1c19]">Privacy</Link>
            <Link href="/terms-of-service" className="transition-colors hover:text-[#1c1c19]">Terms</Link>
            <Link href="/shipping-policy" className="transition-colors hover:text-[#1c1c19]">Shipping Info</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
