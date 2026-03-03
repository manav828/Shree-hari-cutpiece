"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Allow UI to show loading state briefly for premium feel
        setTimeout(() => {
            if (email === "manavss828@gmail.com" && password === "shreehari828") {
                // Set custom admin auth flag in localStorage
                localStorage.setItem("shreehari_admin_auth", "true");
                router.push("/admin");
            } else {
                setError("Invalid admin credentials");
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gold-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-10">
                    <ShieldCheck className="mx-auto h-12 w-12 text-gold-600 mb-4" />
                    <h2 className="text-4xl font-playfair font-bold text-gray-900 mb-2">
                        Control <span className="text-gold-600 italic">Panel</span>
                    </h2>
                    <p className="text-sm text-gray-500 font-sans tracking-wide uppercase">Shree Hari Authorized Access</p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl py-10 px-8 shadow-2xl rounded-2xl border border-white/40">
                    {error && (
                        <div className="mb-6 bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-md text-sm flex items-center shadow-sm">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                Admin Email
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-gold-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200 outline-none hover:bg-white"
                                    placeholder="Enter authorized email"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Admin Password
                                </label>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-gold-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200 outline-none hover:bg-white"
                                    placeholder="••••••••••"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-all duration-300 shadow-md shadow-gray-900/20 disabled:opacity-70"
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                        <span>Authenticating...</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center">
                                        Access Dashboard
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gold-600 transition-colors group">
                            <ArrowRight className="mr-2 h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                            Return to Storefront
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
