"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Manrope, Newsreader } from "next/font/google";
import { useAuth } from "@/context/AuthContext";

const headingFont = Newsreader({
    subsets: ["latin"],
    style: ["normal", "italic"],
    weight: ["400", "500", "600", "700"],
});

const bodyFont = Manrope({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export default function SignupPage() {
    const { signup } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
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
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setIsLoading(true);
        const result = await signup(formData.name.trim(), formData.email.trim(), "", formData.password);

        if (result.success) {
            let redirectUrl = "/login?registered=true";
            if (typeof window !== "undefined") {
                const params = new URLSearchParams(window.location.search);
                const redirectParam = params.get("redirect");
                if (redirectParam) {
                    redirectUrl = `/login?registered=true&redirect=${encodeURIComponent(redirectParam)}`;
                }
            }
            router.push(redirectUrl);
            setIsLoading(false);
        } else {
            setError(result.error || "Something went wrong.");
            setIsLoading(false);
        }
    };

    return (
        <main className={`${bodyFont.className} h-[100dvh] overflow-hidden bg-[#fcf9f4] text-[#1c1c19]`}>
            <div className="flex h-full w-full flex-col md:flex-row">
                <section className="relative hidden overflow-hidden md:flex md:w-1/2">
                    <Image
                        src="/auth/signup-hero.jpg"
                        alt="Warm bohemian living room with terracotta accents and artisan textures"
                        fill
                        priority
                        quality={100}
                        unoptimized
                        sizes="50vw"
                        className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="absolute inset-x-8 bottom-[clamp(1.25rem,3vh,3rem)] text-[#fff7ef] lg:inset-x-12">
                        <p className={`${headingFont.className} max-w-xl text-[clamp(2rem,4.8vh,2.5rem)] italic leading-tight drop-shadow-sm`}>
                            &ldquo;A sanctuary curated with intention, built by human hands.&rdquo;
                        </p>
                        <div className="mt-4 h-1 w-12 bg-[#bf573f]" />
                        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-[#fce8dd]/90">The Artisanal Archive</p>
                    </div>
                </section>

                <section className="relative z-10 flex h-full w-full items-center justify-center bg-[#fcf9f4] px-[clamp(1rem,3vw,2.25rem)] py-[clamp(0.75rem,2.4vh,2rem)] shadow-[-20px_0_40px_rgba(28,28,25,0.02)] md:w-1/2 md:shadow-none lg:px-[clamp(2.5rem,5vw,5.5rem)]">
                    <div className="w-full max-w-md">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#56423d] hover:text-[#9f3f29] transition-colors mb-6"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </Link>
                        <div className="mb-4 md:hidden">
                            <Link href="/" className={`${headingFont.className} text-3xl italic text-[#9f3f29]`}>
                                The Artisanal Archive
                            </Link>
                        </div>

                        <header className="mb-[clamp(0.65rem,1.65vh,1.5rem)]">
                            <h1 className={`${headingFont.className} text-[clamp(2rem,4.8vh,3rem)] leading-[0.96] text-[#1c1c19]`}>
                                Join the Circle of Curators
                            </h1>
                            <p className="mt-2 max-w-lg text-[clamp(0.94rem,2vh,1.07rem)] leading-[1.45] text-[#56423d]">
                                Step into a world where every object tells a story. Register to access exclusive
                                collections, early releases, and the heart of our artisan community.
                            </p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-[clamp(0.65rem,1.45vh,1.35rem)]">
                            <button
                                type="button"
                                className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#ddc0ba] bg-[#fcf9f4] px-8 py-[clamp(0.62rem,1.55vh,0.95rem)] font-medium text-[#1c1c19] transition-colors hover:bg-[#f6f3ee]"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Continue with Google</span>
                            </button>

                            <div className="flex items-center">
                                <div className="h-px flex-1 bg-[#ddc0ba]" />
                                <span className="mx-4 text-xs uppercase tracking-[0.3em] text-[#89726c]">OR</span>
                                <div className="h-px flex-1 bg-[#ddc0ba]" />
                            </div>

                            <div>
                                <label htmlFor="signup-name" className="mb-2 block text-sm font-medium text-[#56423d]">
                                    Full Name
                                </label>
                                <input
                                    id="signup-name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    autoComplete="name"
                                    placeholder="e.g. Jane Doe"
                                    className="w-full rounded-[0.25rem] bg-[#ebe8e3] px-4 py-[clamp(0.62rem,1.5vh,0.9rem)] text-[#1c1c19] placeholder-[#89726c] outline-none transition-colors focus:bg-[#fcf9f4] focus:ring-1 focus:ring-[#9f3f29]"
                                />
                            </div>

                            <div>
                                <label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-[#56423d]">
                                    Email Address
                                </label>
                                <input
                                    id="signup-email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                    placeholder="jane@example.com"
                                    className="w-full rounded-[0.25rem] bg-[#ebe8e3] px-4 py-[clamp(0.62rem,1.5vh,0.9rem)] text-[#1c1c19] placeholder-[#89726c] outline-none transition-colors focus:bg-[#fcf9f4] focus:ring-1 focus:ring-[#9f3f29]"
                                />
                            </div>

                            <div>
                                <label htmlFor="signup-password" className="mb-2 block text-sm font-medium text-[#56423d]">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="signup-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                        minLength={8}
                                        placeholder="••••••••"
                                        className="w-full rounded-[0.25rem] bg-[#ebe8e3] px-4 py-[clamp(0.62rem,1.5vh,0.9rem)] pr-12 text-[#1c1c19] placeholder-[#89726c] outline-none transition-colors focus:bg-[#fcf9f4] focus:ring-1 focus:ring-[#9f3f29]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute inset-y-0 right-0 flex items-center px-4 text-[#89726c] transition-colors hover:text-[#56423d]"
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-[#89726c]">Must be at least 8 characters long.</p>
                            </div>

                            {error && (
                                <div className="rounded-md bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#9f3f29] to-[#bf573f] px-8 py-[clamp(0.66rem,1.55vh,0.95rem)] font-semibold text-white shadow-[0_6px_20px_rgba(159,63,41,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(159,63,41,0.26)] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Creating your account...
                                    </span>
                                ) : (
                                    "Begin Your Journey"
                                )}
                            </button>
                        </form>

                        <p className="mt-[clamp(0.55rem,1.3vh,1rem)] text-center text-sm text-[#56423d]">
                            Already part of the circle?{" "}
                            <Link 
                                href={typeof window !== "undefined" && new URLSearchParams(window.location.search).get("redirect") 
                                    ? `/login?redirect=${encodeURIComponent(new URLSearchParams(window.location.search).get("redirect")!)}` 
                                    : "/login"
                                } 
                                className="font-semibold text-[#9f3f29] transition-colors hover:text-[#bf573f]"
                            >
                                Log in here
                            </Link>
                        </p>

                        <p className="mt-[clamp(0.35rem,1vh,0.7rem)] text-center text-xs text-[#89726c]">
                            By creating an account, you agree to our {" "}
                            <Link href="/terms-of-service" className="text-[#9f3f29] hover:text-[#bf573f]">
                                Terms of Service
                            </Link>{" "}
                            and {" "}
                            <Link href="/privacy-policy" className="text-[#9f3f29] hover:text-[#bf573f]">
                                Privacy Policy
                            </Link>.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
