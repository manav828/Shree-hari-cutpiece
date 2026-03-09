"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/components/cart/CartSidebar";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import SlideToOrder from "@/components/checkout/SlideToOrder";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg("Please sign in or create an account to place your order.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Calculate values
      const shipping_amount = totalPrice >= 999 ? 0 : 99; // Using standard frontend logic
      const subtotal = totalPrice;
      const total_amount = subtotal + shipping_amount;

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
      const order_number = `SH-${dateStr}-${randomSuffix}`;

      // 2. Insert Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number,
          user_id: user.id,
          status: 'pending',
          payment_status: 'pending',
          payment_method: 'cod',
          subtotal,
          shipping_amount,
          total_amount,
          notes: formData.notes,
          delivery_address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
          contact_phone: formData.phone
        })
        .select()
        .single();

      if (orderError || !orderData) throw new Error(orderError?.message || "Failed to create order");

      // 3. Insert Address
      const { error: addressError } = await supabase
        .from('order_addresses')
        .insert({
          order_id: orderData.id,
          type: 'shipping',
          full_name: formData.name,
          phone: formData.phone,
          address_line1: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India'
        });

      if (addressError) console.error("Failed to save address:", addressError);

      // 4. Insert Items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_name: item.name,
        image_url: item.image,
        selling_mode: 'meter', // currently cart only does meters mostly
        quantity_or_meters: item.meters,
        price_per_unit: item.price,
        total_price: item.price * item.meters,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw new Error("Failed to save order items");

      // 5. Insert Status History
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderData.id,
          from_status: null,
          to_status: 'pending',
          note: 'Order placed by customer via website'
        });

      // Firecracker/confetti animation
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

      // Success
      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();
    } catch (err: unknown) {
      console.error("Checkout Error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setErrorMsg(errorMessage);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <>
        <Navbar />
        <CartSidebar />
        <main className="pt-12 lg:pt-24 pb-20 min-h-screen">
          <Container>
            <div className="text-center py-20">
              <svg className="w-20 h-20 mx-auto text-text-secondary mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h1 className="font-serif text-3xl text-foreground mb-4">Your cart is empty</h1>
              <p className="text-text-secondary mb-8">Add some beautiful fabrics to your cart first!</p>
              <Link href="/shop" className="btn-primary">
                Continue Shopping
              </Link>
            </div>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  if (isSuccess) {
    return (
      <>
        <Navbar />
        <CartSidebar />
        <main className="pt-12 lg:pt-24 pb-20 min-h-screen">
          <Container>
            <div className="text-center py-20 max-w-lg mx-auto">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-serif text-3xl text-foreground mb-4">Order Placed Successfully!</h1>
              <p className="text-text-secondary mb-4">
                Thank you for your order. Your order has been placed successfully and is being processed.
              </p>
              <p className="text-text-secondary mb-8">
                Our team will reach out to you shortly to confirm your order and arrange delivery.
              </p>
              <Link href="/shop" className="btn-primary">
                Continue Shopping
              </Link>
            </div>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <CartSidebar />
      <main className="pt-12 lg:pt-24 pb-20">
        <Container>
          <div className="mb-10">
            <Link href="/shop" className="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Shop
            </Link>
          </div>

          <h1 className="font-serif text-4xl text-foreground mb-12">Checkout</h1>

          {errorMsg && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errorMsg}
            </div>
          )}

          {!user && !isLoading && (
            <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-amber-800 font-semibold mb-1">Authentication Required</h3>
                <p className="text-amber-700 text-sm">Please sign in or create an account to proceed with your order.</p>
              </div>
              <div className="flex gap-3">
                <Link href="/login" className="px-5 py-2.5 bg-amber-600 text-white text-sm font-medium rounded hover:bg-amber-700 transition">
                  Sign In
                </Link>
                <Link href="/signup" className="px-5 py-2.5 bg-white text-amber-700 text-sm font-medium rounded border border-amber-300 hover:bg-amber-100 transition">
                  Create Account
                </Link>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Form */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Contact Information */}
                <div className="bg-white p-6 sm:p-8 border border-border shadow-sm">
                  <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-6 pb-4 border-b border-border/60">Contact Information</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="peer w-full px-4 pt-6 pb-2 border-b border-border bg-[#FDFBF7] focus:outline-none focus:border-accent transition-colors focus:bg-white placeholder-transparent rounded-t-md"
                        placeholder="Full Name *"
                      />
                      <label htmlFor="name" className="absolute left-4 top-2 text-[10px] sm:text-xs text-text-secondary transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] sm:peer-focus:text-xs peer-focus:text-accent font-medium pointer-events-none">
                        Full Name *
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="peer w-full px-4 pt-6 pb-2 border-b border-border bg-[#FDFBF7] focus:outline-none focus:border-accent transition-colors focus:bg-white placeholder-transparent rounded-t-md"
                        placeholder="Phone Number *"
                      />
                      <label htmlFor="phone" className="absolute left-4 top-2 text-[10px] sm:text-xs text-text-secondary transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] sm:peer-focus:text-xs peer-focus:text-accent font-medium pointer-events-none">
                        Phone Number *
                      </label>
                    </div>
                    <div className="sm:col-span-2 relative">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="peer w-full px-4 pt-6 pb-2 border-b border-border bg-[#FDFBF7] focus:outline-none focus:border-accent transition-colors focus:bg-white placeholder-transparent rounded-t-md"
                        placeholder="Email Address"
                      />
                      <label htmlFor="email" className="absolute left-4 top-2 text-[10px] sm:text-xs text-text-secondary transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] sm:peer-focus:text-xs peer-focus:text-accent font-medium pointer-events-none">
                        Email Address (Optional)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white p-6 sm:p-8 border border-border shadow-sm">
                  <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-6 pb-4 border-b border-border/60">Shipping Address</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2 relative">
                      <textarea
                        name="address"
                        id="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="peer w-full px-4 pt-6 pb-2 border-b border-border bg-[#FDFBF7] focus:outline-none focus:border-accent transition-colors focus:bg-white placeholder-transparent rounded-t-md resize-none"
                        placeholder="Address *"
                      />
                      <label htmlFor="address" className="absolute left-4 top-2 text-[10px] sm:text-xs text-text-secondary transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] sm:peer-focus:text-xs peer-focus:text-accent font-medium pointer-events-none">
                        Complete Address *
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="city"
                        id="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="peer w-full px-4 pt-6 pb-2 border-b border-border bg-[#FDFBF7] focus:outline-none focus:border-accent transition-colors focus:bg-white placeholder-transparent rounded-t-md"
                        placeholder="City *"
                      />
                      <label htmlFor="city" className="absolute left-4 top-2 text-[10px] sm:text-xs text-text-secondary transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] sm:peer-focus:text-xs peer-focus:text-accent font-medium pointer-events-none">
                        City *
                      </label>
                    </div>
                    <div className="relative">
                      <select
                        name="state"
                        id="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="peer w-full px-4 pt-6 pb-2 border-b border-border bg-[#FDFBF7] focus:outline-none focus:border-accent transition-colors focus:bg-white text-foreground rounded-t-md appearance-none"
                      >
                        <option value="" disabled className="text-gray-400">Select State</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Other">Other</option>
                      </select>
                      <label htmlFor="state" className="absolute left-4 top-2 text-[10px] sm:text-xs text-text-secondary font-medium pointer-events-none transition-all">
                        State *
                      </label>
                      <div className="absolute right-4 top-1/2 mt-1 pointer-events-none text-text-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="pincode"
                        id="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        className="peer w-full px-4 pt-6 pb-2 border-b border-border bg-[#FDFBF7] focus:outline-none focus:border-accent transition-colors focus:bg-white placeholder-transparent rounded-t-md"
                        placeholder="Pincode *"
                      />
                      <label htmlFor="pincode" className="absolute left-4 top-2 text-[10px] sm:text-xs text-text-secondary transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] sm:peer-focus:text-xs peer-focus:text-accent font-medium pointer-events-none">
                        Pincode *
                      </label>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="bg-white p-6 sm:p-8 border border-border shadow-sm">
                  <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-6 pb-4 border-b border-border/60">Additional Notes</h2>
                  <div className="relative">
                    <textarea
                      name="notes"
                      id="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="peer w-full px-4 pt-6 pb-2 border-b border-border bg-[#FDFBF7] focus:outline-none focus:border-accent transition-colors focus:bg-white placeholder-transparent rounded-t-md resize-none"
                      placeholder="Notes"
                    />
                    <label htmlFor="notes" className="absolute left-4 top-2 text-[10px] sm:text-xs text-text-secondary transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] sm:peer-focus:text-xs peer-focus:text-accent font-medium pointer-events-none">
                      Any special instructions for your order (optional)
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <SlideToOrder
                    isSubmitting={isSubmitting}
                    onSubmit={() => {
                      // Trigger form submission manually since it's a div not button
                      const form = document.querySelector('form');
                      if (form) {
                        form.requestSubmit();
                      }
                    }}
                  />
                  <p className="text-text-secondary text-[11px] sm:text-xs text-center mt-6">
                    By placing this order, you agree to our terms and conditions.
                    You will receive an order confirmation email shortly.
                  </p>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="order-1 lg:order-2">
              <div className="bg-background-secondary p-6 sticky top-32">
                <h2 className="font-serif text-xl text-foreground mb-6">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-20 relative bg-white flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-foreground line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-text-secondary text-sm">
                          {item.meters}m x {formatPrice(item.price)}
                        </p>
                        <p className="text-foreground font-medium text-sm">
                          {formatPrice(item.price * item.meters)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="text-foreground">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Shipping</span>
                    <span className="text-foreground">
                      {totalPrice >= 999 ? "FREE" : formatPrice(99)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-medium pt-3 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">
                      {formatPrice(totalPrice >= 999 ? totalPrice : totalPrice + 99)}
                    </span>
                  </div>
                </div>

                {totalPrice < 999 && (
                  <p className="text-accent text-sm mt-4">
                    Add {formatPrice(999 - totalPrice)} more for FREE delivery!
                  </p>
                )}
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
