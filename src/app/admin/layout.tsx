"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Layout,
    Package,
    ShoppingCart,
    Users,
    Tags,
    FileText,
    BookOpen,
    BarChart,
    Settings,
    LogOut,
    Menu,
    X
} from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (pathname === "/admin/login") { setIsChecking(false); return; }
        const authState = localStorage.getItem("shreehari_admin_auth");
        if (authState === "true") { setIsAuthorized(true); } else { router.push("/admin/login"); }
        setIsChecking(false);
    }, [pathname, router]);

    useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

    const handleSignOut = () => {
        localStorage.removeItem("shreehari_admin_auth");
        setIsAuthorized(false);
        router.push("/admin/login");
    };

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Products", href: "/admin/products", icon: Package },
        { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
        { name: "Customers", href: "/admin/customers", icon: Users },
        { name: "Coupons", href: "/admin/coupons", icon: Tags },
        { name: "Content & Banners", href: "/admin/cms", icon: Layout },
        { name: "Documentation", href: "/admin/documentation", icon: BookOpen },
        { name: "Blog", href: "/admin/blog", icon: FileText },
        { name: "Reports", href: "/admin/reports", icon: BarChart },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    if (pathname === "/admin/login") return <>{children}</>;

    if (isChecking || !isAuthorized) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-7 h-7 rounded-full border-[3px] border-blue-200 border-t-blue-700 animate-spin" />
                    <p className="text-[13px] text-slate-500 font-medium tracking-wide">Loading...</p>
                </div>
            </div>
        );
    }

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="px-5 pt-6 pb-8 border-b border-slate-700/70">
                <Link href="/admin" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-300 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <span className="text-slate-900 text-sm font-bold">SH</span>
                    </div>
                    <div>
                        <p className="text-[15px] font-semibold text-white leading-tight">Shree Hari</p>
                        <p className="text-[10px] text-slate-300 uppercase tracking-[0.15em] font-medium">Admin Panel</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                <p className="px-3 pt-3 pb-2 text-[10px] font-semibold text-slate-300 uppercase tracking-[0.12em]">Menu</p>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== "/admin");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-150 ${isActive
                                ? "bg-gradient-to-r from-cyan-300 to-blue-400 text-slate-900 shadow-md shadow-blue-900/20"
                                : "text-slate-200 hover:text-white hover:bg-slate-700/70"
                                }`}
                        >
                            <item.icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? "text-slate-900" : "text-slate-300"}`} strokeWidth={isActive ? 2.2 : 1.8} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-3 mt-auto">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] font-medium text-slate-200 rounded-lg hover:bg-red-500/20 hover:text-red-200 transition-all duration-150"
                >
                    <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    Logout
                </button>
            </div>
        </>
    );

    return (
        <div data-admin className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex overflow-hidden font-sans">
            {/* Desktop Sidebar — STICKY via fixed height + flex */}
            <aside className="hidden md:flex md:w-[252px] flex-col bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 border-r border-slate-700/80 h-screen sticky top-0 flex-shrink-0 shadow-xl">
                <SidebarContent />
            </aside>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="relative w-[270px] bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 h-full flex flex-col shadow-2xl animate-slide-in-left">
                        <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-3 p-1.5 text-slate-300 hover:text-white">
                            <X className="h-5 w-5" />
                        </button>
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Top Bar */}
                <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-blue-100 px-4 py-3 flex items-center justify-between flex-shrink-0 z-10">
                    <button onClick={() => setMobileMenuOpen(true)} className="p-1.5 -ml-1 text-slate-600">
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-semibold text-slate-900">Shree Hari Admin</span>
                    <button onClick={handleSignOut} className="p-1.5 text-slate-400 hover:text-red-500">
                        <LogOut className="h-4 w-4" />
                    </button>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-5 md:px-10 py-6 md:py-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
