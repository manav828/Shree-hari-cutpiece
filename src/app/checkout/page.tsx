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

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create WhatsApp message with order details
    const orderItems = items.map((item) => 
      `- ${item.name}: ${item.meters}m x ${formatPrice(item.price)} = ${formatPrice(item.price * item.meters)}`
    ).join("\n");

    const message = `
*New Order from Shree Hari Cutpiece Website*

*Customer Details:*
Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}
Address: ${formData.address}
City: ${formData.city}
State: ${formData.state}
Pincode: ${formData.pincode}

*Order Items:*
${orderItems}

*Total: ${formatPrice(totalPrice)}*

${formData.notes ? `*Notes:* ${formData.notes}` : ""}
    `.trim();

    // Encode message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/91XXXXXXXXXX?text=${encodedMessage}`;

    // Show success and open WhatsApp
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, "_blank");
    }, 1500);
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <>
        <Navbar />
        <CartSidebar />
        <main className="pt-32 pb-20 min-h-screen">
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
        <main className="pt-32 pb-20 min-h-screen">
          <Container>
            <div className="text-center py-20 max-w-lg mx-auto">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-serif text-3xl text-foreground mb-4">Order Placed Successfully!</h1>
              <p className="text-text-secondary mb-4">
                Thank you for your order. We've opened WhatsApp with your order details. 
                Please send the message to confirm your order.
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
      <main className="pt-32 pb-20">
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

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Information */}
                <div>
                  <h2 className="font-serif text-xl text-foreground mb-6">Contact Information</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-border focus:border-accent focus:outline-none transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-border focus:border-accent focus:outline-none transition-colors"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-text-secondary mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border focus:border-accent focus:outline-none transition-colors"
                        placeholder="Enter your email (optional)"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h2 className="font-serif text-xl text-foreground mb-6">Shipping Address</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-text-secondary mb-2">Address *</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full px-4 py-3 border border-border focus:border-accent focus:outline-none transition-colors resize-none"
                        placeholder="Enter your complete address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-border focus:border-accent focus:outline-none transition-colors"
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">State *</label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-border focus:border-accent focus:outline-none transition-colors bg-white"
                      >
                        <option value="">Select State</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-border focus:border-accent focus:outline-none transition-colors"
                        placeholder="Enter pincode"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <h2 className="font-serif text-xl text-foreground mb-6">Additional Notes</h2>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-border focus:border-accent focus:outline-none transition-colors resize-none"
                    placeholder="Any special instructions for your order (optional)"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary justify-center gap-3 text-lg py-5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Place Order via WhatsApp
                    </>
                  )}
                </button>

                <p className="text-text-secondary text-sm text-center">
                  By placing this order, you agree to our terms and conditions. 
                  Our team will confirm your order and payment details via WhatsApp.
                </p>
              </form>
            </div>

            {/* Order Summary */}
            <div>
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
