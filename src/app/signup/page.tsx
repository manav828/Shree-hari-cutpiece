"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
    const { signup } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setIsLoading(true);
        const result = await signup(formData.name, formData.email, formData.phone, formData.password);
        if (result.success) {
            router.push("/account");
        } else {
            setError(result.error || "Something went wrong.");
            setIsLoading(false);
        }
    };

    const fields = [
        { name: "name", label: "Full Name", type: "text", autoComplete: "name", required: true },
        { name: "email", label: "Email Address", type: "email", autoComplete: "email", required: true },
        { name: "phone", label: "Phone Number (Optional)", type: "tel", autoComplete: "tel", required: false },
        { name: "password", label: "Create Password", type: showPassword ? "text" : "password", autoComplete: "new-password", required: true },
        { name: "confirmPassword", label: "Confirm Password", type: showPassword ? "text" : "password", autoComplete: "new-password", required: true },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Brand Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=90"
                    alt="Shree Hari Fabrics"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-foreground/90 via-foreground/70 to-accent/40" />
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    <Link href="/" className="flex items-center gap-3">
                        <span className="font-serif text-2xl text-white">Shree Hari</span>
                        <span className="text-white/60 text-sm tracking-widest uppercase">Cutpiece</span>
                    </Link>
                    <div>
                        <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-4">Join the Family</p>
                        <blockquote className="font-serif text-3xl text-white leading-relaxed mb-6">
                            &ldquo;Be the first to discover our exclusive arrivals and offers.&rdquo;
                        </blockquote>
                        <p className="text-white/70 text-sm">
                            Create your account to track orders, save favourites, and unlock member — only deals.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Signup Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center min-h-screen bg-[#F7F0F1]">
                {/* Mobile header */}
                <div className="lg:hidden px-6 pt-8 pb-4">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-serif text-xl text-foreground">Shree Hari</span>
                        <span className="text-text-secondary text-xs tracking-widest uppercase">Cutpiece</span>
                    </Link>
                </div>

                <div className="flex-1 flex items-center justify-center px-6 py-10">
                    <div className="w-full max-w-md">
                        {/* Header */}
                        <div className="mb-8">
                            <p className="text-accent text-xs tracking-[0.3em] uppercase mb-3 font-medium">New Member</p>
                            <h1 className="font-serif text-4xl text-foreground mb-2">Create Account</h1>
                            <p className="text-text-secondary text-sm">
                                Already have an account?{" "}
                                <Link href="/login" className="text-accent hover:underline font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {fields.map((field) => (
                                <div key={field.name} className="relative">
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        id={`signup-${field.name}`}
                                        value={formData[field.name as keyof typeof formData]}
                                        onChange={handleChange}
                                        required={field.required}
                                        autoComplete={field.autoComplete}
                                        className="peer w-full px-4 pt-6 pb-2 border-b-2 border-border bg-white/80 focus:outline-none focus:border-accent transition-colors placeholder-transparent rounded-t-md"
                                        placeholder={field.label}
                                    />
                                    <label
                                        htmlFor={`signup-${field.name}`}
                                        className="absolute left-4 top-2 text-[10px] text-text-secondary transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-accent font-medium pointer-events-none"
                                    >
                                        {field.label}
                                    </label>
                                </div>
                            ))}

                            {/* Show/hide password toggle */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="flex items-center gap-2 text-xs text-text-secondary hover:text-accent transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {showPassword ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    ) : (
                                        <>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </>
                                    )}
                                </svg>
                                {showPassword ? "Hide passwords" : "Show passwords"}
                            </button>

                            {/* Error Message */}
                            {error && (
                                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Terms */}
                            <p className="text-xs text-text-secondary">
                                By creating an account, you agree to our{" "}
                                <Link href="#" className="text-accent hover:underline">Terms of Service</Link>{" "}
                                and{" "}
                                <Link href="#" className="text-accent hover:underline">Privacy Policy</Link>.
                            </p>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Creating account...
                                    </span>
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        </form>

                        {/* Back to home */}
                        <p className="text-center text-xs text-text-secondary mt-6">
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
