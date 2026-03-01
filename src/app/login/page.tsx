"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await login(formData.email, formData.password);
        if (result.success) {
            router.push("/account");
        } else {
            setError(result.error || "Something went wrong.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Brand Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=90"
                    alt="Shree Hari Fabrics"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-foreground/90 via-foreground/70 to-accent/40" />
                {/* Brand content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    <Link href="/" className="flex items-center gap-3">
                        <span className="font-serif text-2xl text-white">Shree Hari</span>
                        <span className="text-white/60 text-sm tracking-widest uppercase">Cutpiece</span>
                    </Link>
                    <div>
                        <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-4">Est. 1987</p>
                        <blockquote className="font-serif text-3xl text-white leading-relaxed mb-6">
                            &ldquo;Where every thread tells a story of craftsmanship and tradition.&rdquo;
                        </blockquote>
                        <p className="text-white/70 text-sm">
                            Over 35 years of bringing the finest fabrics from across India to your doorstep.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center min-h-screen bg-[#F7F0F1]">
                {/* Mobile header */}
                <div className="lg:hidden px-6 pt-8 pb-6">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-serif text-xl text-foreground">Shree Hari</span>
                        <span className="text-text-secondary text-xs tracking-widest uppercase">Cutpiece</span>
                    </Link>
                </div>

                <div className="flex-1 flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md">
                        {/* Header */}
                        <div className="mb-10">
                            <p className="text-accent text-xs tracking-[0.3em] uppercase mb-3 font-medium">Welcome Back</p>
                            <h1 className="font-serif text-4xl text-foreground mb-2">Sign In</h1>
                            <p className="text-text-secondary text-sm">
                                Don&apos;t have an account?{" "}
                                <Link href="/signup" className="text-accent hover:underline font-medium">
                                    Create one
                                </Link>
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    id="login-email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="peer w-full px-4 pt-6 pb-2 border-b-2 border-border bg-white/80 focus:outline-none focus:border-accent transition-colors placeholder-transparent rounded-t-md"
                                    placeholder="Email Address"
                                    autoComplete="email"
                                />
                                <label
                                    htmlFor="login-email"
                                    className="absolute left-4 top-2 text-[10px] text-text-secondary transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-accent font-medium pointer-events-none"
                                >
                                    Email Address
                                </label>
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="login-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="peer w-full px-4 pt-6 pb-2 border-b-2 border-border bg-white/80 focus:outline-none focus:border-accent transition-colors placeholder-transparent rounded-t-md pr-12"
                                    placeholder="Password"
                                    autoComplete="current-password"
                                />
                                <label
                                    htmlFor="login-password"
                                    className="absolute left-4 top-2 text-[10px] text-text-secondary transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-accent font-medium pointer-events-none"
                                >
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -mt-1 text-text-secondary hover:text-foreground transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Forgot Password */}
                            <div className="text-right">
                                <Link href="#" className="text-xs text-text-secondary hover:text-accent transition-colors">
                                    Forgot your password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary justify-center py-4 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-8 flex items-center gap-4">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-text-secondary text-xs tracking-wide">OR</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        {/* Continue as Guest */}
                        <Link href="/shop" className="btn-secondary w-full justify-center py-4 text-sm">
                            Continue Browsing as Guest
                        </Link>

                        {/* Back to home */}
                        <p className="text-center text-xs text-text-secondary mt-8">
                            <Link href="/" className="hover:text-accent transition-colors">
                                ← Back to Home
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
