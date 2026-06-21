"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Manrope, Newsreader } from "next/font/google";
import { useAuth } from "@/context/AuthContext";
import { getWhatsAppUrl } from "@/lib/brand";

const headingFont = Newsreader({
    subsets: ["latin"],
    style: ["normal", "italic"],
    weight: ["400", "500", "600", "700"],
});

const bodyFont = Manrope({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showRegisteredMessage, setShowRegisteredMessage] = useState(false);
    const supportLink = getWhatsAppUrl("Hi, I need help logging into my account.");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("registered") === "true") {
                setShowRegisteredMessage(true);
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await login(formData.email.trim(), formData.password);
        if (result.success) {
            let redirectUrl = "/";
            if (typeof window !== "undefined") {
                const params = new URLSearchParams(window.location.search);
                redirectUrl = params.get("redirect") || "/";
            }
            router.push(redirectUrl);
        } else {
            setError(result.error || "Something went wrong.");
            setIsLoading(false);
        }
    };

    return (
        <main className={`${bodyFont.className} h-[100dvh] overflow-hidden bg-[#fcf9f4] text-[#1c1c19] antialiased`}>
            <div className="flex h-full flex-col md:flex-row">
                <section className="relative hidden overflow-hidden md:flex md:w-1/2">
                    <Image
                        src="/auth/login-hero.jpg"
                        alt="High-resolution warm interior with earthy styling and natural textures"
                        fill
                        priority
                        quality={100}
                        unoptimized
                        sizes="50vw"
                        className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#e5e2dd]/80 via-transparent to-transparent" />
                    <div className="relative z-10 flex h-full w-full flex-col justify-end p-[clamp(1.5rem,4vh,4rem)] text-[#1c1c19]">
                        <h2 className={`${headingFont.className} text-[clamp(2.25rem,5vh,3.75rem)] leading-[0.98] tracking-tight`}>
                            Curate your space.
                            <br />
                            Ground your soul.
                        </h2>
                        <p className="mt-3 max-w-md text-[clamp(1rem,2.2vh,1.5rem)] text-[#56423d]">
                            Access your personal archive of artisanal finds and earthy aesthetics.
                        </p>
                    </div>
                </section>

                <section className="relative z-10 flex h-full w-full items-center justify-center bg-[#fcf9f4] px-[clamp(1rem,3vw,2.25rem)] py-[clamp(0.75rem,2.4vh,2rem)] shadow-[-20px_0_40px_rgba(28,28,25,0.02)] md:w-1/2 md:shadow-none lg:px-[clamp(2.5rem,5vw,5.5rem)]">
                    <div className="w-full max-w-md space-y-[clamp(0.7rem,1.7vh,1.9rem)]">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#56423d] hover:text-[#9f3f29] transition-colors mb-2"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </Link>
                        <header className="text-center md:text-left">
                            <h1 className={`${headingFont.className} mb-2 text-[clamp(2rem,4.8vh,3.1rem)] leading-[0.96] text-[#9f3f29]`}>Welcome back.</h1>
                            <p className="text-base text-[#56423d]">Continue your journey with Terra &amp; Loom.</p>
                        </header>

                        <div className="space-y-[clamp(0.45rem,1.15vh,0.75rem)]">
                            <button
                                type="button"
                                className="group flex w-full items-center justify-center gap-3 rounded-lg bg-[#f6f3ee] px-6 py-[clamp(0.62rem,1.5vh,0.95rem)] font-medium text-[#1c1c19] transition-colors duration-300 hover:bg-[#f0ede8]"
                            >
                                <svg className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.58c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </button>
                            <button
                                type="button"
                                className="group flex w-full items-center justify-center gap-3 rounded-lg bg-[#f6f3ee] px-6 py-[clamp(0.62rem,1.5vh,0.95rem)] font-medium text-[#1c1c19] transition-colors duration-300 hover:bg-[#f0ede8]"
                            >
                                <svg className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.97 3.67 2.14-3.32 1.83-2.73 6.17.65 7.42-.82 1.54-1.6 3-2.97 3.45zm-4.38-14.2c-.12-1.92 1.63-3.73 3.5-3.86.32 2.09-1.8 3.82-3.5 3.86z" />
                                </svg>
                                Continue with Apple
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-[#dcdad5]" />
                            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#56423d]">Or</span>
                            <div className="h-px flex-1 bg-[#dcdad5]" />
                        </div>

                        {showRegisteredMessage && (
                            <div className="rounded-md bg-[#e6f4ea] border border-[#34a853]/20 px-4 py-3 text-sm text-[#137333]">
                                Account created successfully! Please sign in below to continue.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-[clamp(0.65rem,1.4vh,1.25rem)]">
                            <div className="space-y-1.5">
                                <label htmlFor="login-email" className="block px-1 text-sm font-medium text-[#56423d]">
                                    Email Address
                                </label>
                                <input
                                    id="login-email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                    placeholder="hello@example.com"
                                    className="w-full rounded-t-lg rounded-b-none border-0 border-b border-b-transparent bg-[#ebe8e3] px-4 py-[clamp(0.62rem,1.45vh,0.92rem)] text-[#1c1c19] placeholder:text-[#89726c]/60 focus:bg-[#fcf9f4] focus:border-b-[#9f3f29] focus:ring-0"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between px-1">
                                    <label htmlFor="login-password" className="block text-sm font-medium text-[#56423d]">
                                        Password
                                    </label>
                                    <Link href={supportLink} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#9f3f29] hover:text-[#bf573f]">
                                        Forgot password?
                                    </Link>
                                </div>
                                <input
                                    id="login-password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="current-password"
                                    placeholder="********"
                                    className="w-full rounded-t-lg rounded-b-none border-0 border-b border-b-transparent bg-[#ebe8e3] px-4 py-[clamp(0.62rem,1.45vh,0.92rem)] text-[#1c1c19] placeholder:text-[#89726c]/60 focus:bg-[#fcf9f4] focus:border-b-[#9f3f29] focus:ring-0"
                                />
                            </div>

                            {error && (
                                <div className="rounded-md bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#9f3f29] to-[#bf573f] py-[clamp(0.66rem,1.55vh,0.95rem)] text-base font-medium text-white shadow-[0_4px_16px_rgba(159,63,41,0.15)] transition-opacity duration-300 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    <>
                                        Sign In
                                        <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M5 12h14M13 6l6 6-6 6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="pt-[clamp(0.35rem,0.9vh,0.75rem)] text-center text-sm text-[#56423d]">
                            New to the archive?{" "}
                            <Link 
                                href={typeof window !== "undefined" && new URLSearchParams(window.location.search).get("redirect") 
                                    ? `/signup?redirect=${encodeURIComponent(new URLSearchParams(window.location.search).get("redirect")!)}` 
                                    : "/signup"
                                } 
                                className="font-medium text-[#9f3f29] underline decoration-[#9f3f29]/30 underline-offset-4 hover:text-[#bf573f] hover:decoration-[#9f3f29]"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
