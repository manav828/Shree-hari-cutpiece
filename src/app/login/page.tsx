"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Manrope, Newsreader } from "next/font/google";
import { useAuth } from "@/context/AuthContext";
import { getWhatsAppUrl } from "@/lib/brand";
import { getThemeSync } from "@/lib/themeSync";

const headingFont = Newsreader({
    subsets: ["latin"],
    style: ["normal", "italic"],
    weight: ["400", "500", "600", "700"],
});

const bodyFont = Manrope({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const themeStyles = {
  bohemian: {
    bg: "bg-[#fcf9f4]",
    text: "text-[#1c1c19]",
    accentText: "text-[#9f3f29]",
    subtext: "text-[#56423d]",
    inputBg: "bg-[#ebe8e3]",
    inputFocus: "focus:bg-[#fcf9f4] focus:border-b-[#9f3f29]",
    button: "bg-gradient-to-r from-[#9f3f29] to-[#bf573f] text-white shadow-[0_4px_16px_rgba(159,63,41,0.15)] hover:opacity-95",
    buttonGoogle: "bg-[#f6f3ee] hover:bg-[#f0ede8] border-[#ddc0ba]/40 border",
    dividerBg: "bg-[#dcdad5]",
    heroImage: "/auth/login-hero.jpg",
    heroAlt: "High-resolution warm interior with earthy styling and natural textures",
    headingFontClass: headingFont.className,
    heroHeading: "Curate your space.\nGround your soul.",
    heroSubheading: "Access your personal archive of artisanal finds and earthy aesthetics.",
    welcomeBack: "Welcome back.",
    journeyText: "Continue your journey with Terra & Loom.",
    newToArchiveText: "New to the archive?",
    linkHoverClass: "hover:text-[#9f3f29]",
    accentHoverText: "hover:text-[#bf573f]",
    linkDecoration: "decoration-[#9f3f29]/30 hover:decoration-[#9f3f29]"
  },
  classic: {
    bg: "bg-white",
    text: "text-foreground",
    accentText: "text-accent",
    subtext: "text-text-secondary",
    inputBg: "bg-background-secondary",
    inputFocus: "focus:bg-white focus:border-b-accent",
    button: "bg-accent hover:bg-[#721833] text-white shadow-sm",
    buttonGoogle: "bg-background-secondary hover:bg-background-secondary/80 border-border border",
    dividerBg: "bg-border",
    heroImage: "/auth/classic-login-hero.png",
    heroAlt: "High-quality premium textiles and fabrics in a retail store",
    headingFontClass: bodyFont.className,
    heroHeading: "Weave your dream.\nQuality in every thread.",
    heroSubheading: "Access your dashboard to track orders, manage addresses, and explore fabrics.",
    welcomeBack: "Welcome back.",
    journeyText: "Continue your shopping experience with Shree Hari Cutpiece.",
    newToArchiveText: "New to Shree Hari?",
    linkHoverClass: "hover:text-accent",
    accentHoverText: "hover:text-[#721833]",
    linkDecoration: "decoration-accent/30 hover:decoration-accent"
  },
  luxury: {
    bg: "bg-[#0a0a0a]",
    text: "text-white",
    accentText: "text-[#d4af37]",
    subtext: "text-gray-400",
    inputBg: "bg-[#1c1c1c]",
    inputFocus: "focus:bg-[#121212] focus:border-b-[#d4af37]",
    button: "bg-[#d4af37] hover:bg-[#c29d2c] text-black font-semibold shadow-[0_4px_16px_rgba(212,175,55,0.15)]",
    buttonGoogle: "bg-[#1c1c1c] hover:bg-[#2c2c2c] border-[#d4af37]/20 border text-white",
    dividerBg: "bg-[#d4af37]/20",
    heroImage: "/auth/luxury-login-hero.png",
    heroAlt: "Elegant luxury silk and satin draping fabrics",
    headingFontClass: bodyFont.className,
    heroHeading: "Atelier of Excellence.\nDesigned for the Rare.",
    heroSubheading: "Access your private selection of luxury couture and bespoke services.",
    welcomeBack: "Welcome back.",
    journeyText: "Continue your luxury experience with Shree Hari Couture.",
    newToArchiveText: "New to Shree Hari Couture?",
    linkHoverClass: "hover:text-[#d4af37]",
    accentHoverText: "hover:text-[#c29d2c]",
    linkDecoration: "decoration-[#d4af37]/30 hover:decoration-[#d4af37]"
  }
};

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showRegisteredMessage, setShowRegisteredMessage] = useState(false);
    const [showAlreadyRegisteredMessage, setShowAlreadyRegisteredMessage] = useState(false);
    const supportLink = getWhatsAppUrl("Hi, I need help logging into my account.");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("registered") === "true") {
                setShowRegisteredMessage(true);
            }
            if (params.get("error") === "already_registered") {
                setShowAlreadyRegisteredMessage(true);
            }
            const emailParam = params.get("email");
            if (emailParam) {
                setFormData((prev) => ({ ...prev, email: emailParam }));
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.email.length > 254) {
            setError("Email must be 254 characters or less.");
            return;
        }
        if (formData.password.length > 128) {
            setError("Password must be 128 characters or less.");
            return;
        }
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

    const theme = getThemeSync();
    const styles = themeStyles[theme] || themeStyles.classic;

    return (
        <main className={`${bodyFont.className} h-[100dvh] overflow-hidden ${styles.bg} ${styles.text} antialiased`}>
            <div className="flex h-full flex-col md:flex-row">
                <section className="relative hidden overflow-hidden md:flex md:w-1/2">
                    <Image
                        src={styles.heroImage}
                        alt={styles.heroAlt}
                        fill
                        priority
                        quality={100}
                        unoptimized
                        sizes="50vw"
                        className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    <div className="relative z-10 flex h-full w-full flex-col justify-end p-[clamp(1.5rem,4vh,4rem)] text-white">
                        <h2 className={`${styles.headingFontClass} text-[clamp(2.25rem,5vh,3.75rem)] leading-[0.98] tracking-tight whitespace-pre-line`}>
                            {styles.heroHeading}
                        </h2>
                        <p className="mt-3 max-w-md text-[clamp(1rem,2.2vh,1.5rem)] text-white/90">
                            {styles.heroSubheading}
                        </p>
                    </div>
                </section>

                <section className={`relative z-10 flex h-full w-full items-center justify-center ${styles.bg} px-[clamp(1rem,3vw,2.25rem)] py-[clamp(0.75rem,2.4vh,2rem)] shadow-[-20px_0_40px_rgba(28,28,25,0.02)] md:w-1/2 md:shadow-none lg:px-[clamp(2.5rem,5vw,5.5rem)]`}>
                    <div className="w-full max-w-md space-y-[clamp(0.7rem,1.7vh,1.9rem)]">
                        <Link 
                            href="/" 
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${styles.subtext} ${styles.linkHoverClass} transition-colors mb-2`}
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </Link>
                        <header className="text-center md:text-left">
                            <h1 className={`${styles.headingFontClass} mb-2 text-[clamp(2rem,4.8vh,3.1rem)] leading-[0.96] ${styles.accentText}`}>{styles.welcomeBack}</h1>
                            <p className={`text-base ${styles.subtext}`}>{styles.journeyText}</p>
                        </header>

                        <div className="space-y-[clamp(0.45rem,1.15vh,0.75rem)]">
                            <button
                                type="button"
                                className={`group flex w-full items-center justify-center gap-3 rounded-lg ${styles.buttonGoogle} px-6 py-[clamp(0.62rem,1.5vh,0.95rem)] font-medium transition-colors duration-300`}
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
                                className={`group flex w-full items-center justify-center gap-3 rounded-lg ${styles.buttonGoogle} px-6 py-[clamp(0.62rem,1.5vh,0.95rem)] font-medium transition-colors duration-300`}
                            >
                                <svg className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.97 3.67 2.14-3.32 1.83-2.73 6.17.65 7.42-.82 1.54-1.6 3-2.97 3.45zm-4.38-14.2c-.12-1.92 1.63-3.73 3.5-3.86.32 2.09-1.8 3.82-3.5 3.86z" />
                                </svg>
                                Continue with Apple
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`h-px flex-1 ${styles.dividerBg}`} />
                            <span className={`text-xs font-medium uppercase tracking-[0.2em] ${styles.subtext}`}>Or</span>
                            <div className={`h-px flex-1 ${styles.dividerBg}`} />
                        </div>

                        {showRegisteredMessage && (
                            <div className="rounded-md bg-[#e6f4ea] border border-[#34a853]/20 px-4 py-3 text-sm text-[#137333]">
                                Account created successfully! Please sign in below to continue.
                            </div>
                        )}

                        {showAlreadyRegisteredMessage && (
                            <div className="rounded-md bg-[#fff3cd] border border-[#ffc107]/30 px-4 py-3 text-sm text-[#856404]">
                                An account with this email already exists. Please sign in below to continue.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-[clamp(0.65rem,1.4vh,1.25rem)]">
                            <div className="space-y-1.5">
                                <label htmlFor="login-email" className={`block px-1 text-sm font-medium ${styles.subtext}`}>
                                    Email Address
                                </label>
                                <input
                                    id="login-email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    maxLength={254}
                                    autoComplete="email"
                                    placeholder="hello@example.com"
                                    className={`w-full rounded-t-lg rounded-b-none border-0 border-b border-b-transparent ${styles.inputBg} px-4 py-[clamp(0.62rem,1.45vh,0.92rem)] text-inherit placeholder:opacity-50 ${styles.inputFocus} focus:ring-0`}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between px-1">
                                    <label htmlFor="login-password" className={`block text-sm font-medium ${styles.subtext}`}>
                                        Password
                                    </label>
                                    <Link href={supportLink} target="_blank" rel="noopener noreferrer" className={`text-sm font-medium ${styles.accentText} ${styles.accentHoverText}`}>
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
                                    maxLength={128}
                                    autoComplete="current-password"
                                    placeholder="********"
                                    className={`w-full rounded-t-lg rounded-b-none border-0 border-b border-b-transparent ${styles.inputBg} px-4 py-[clamp(0.62rem,1.45vh,0.92rem)] text-inherit placeholder:opacity-50 ${styles.inputFocus} focus:ring-0`}
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
                                className={`group flex w-full items-center justify-center gap-2 rounded-lg ${styles.button} py-[clamp(0.66rem,1.55vh,0.95rem)] text-base font-medium transition-all duration-300 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70`}
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

                        <p className={`pt-[clamp(0.35rem,0.9vh,0.75rem)] text-center text-sm ${styles.subtext}`}>
                            {styles.newToArchiveText}{" "}
                            <Link 
                                href={typeof window !== "undefined" && new URLSearchParams(window.location.search).get("redirect") 
                                    ? `/signup?redirect=${encodeURIComponent(new URLSearchParams(window.location.search).get("redirect")!)}` 
                                    : "/signup"
                                } 
                                className={`font-medium ${styles.accentText} underline ${styles.linkDecoration} ${styles.accentHoverText}`}
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
