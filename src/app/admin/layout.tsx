"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Tags,
    FileText,
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
        { name: "Blog", href: "/admin/blog", icon: FileText },
        { name: "Reports", href: "/admin/reports", icon: BarChart },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    if (pathname === "/admin/login") return <>{children}</>;

    if (isChecking || !isAuthorized) {
        return (
            <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-7 h-7 rounded-full border-[3px] border-gray-200 border-t-gray-800 animate-spin" />
                    <p className="text-[13px] text-gray-400 font-medium tracking-wide">Loading...</p>
                </div>
            </div>
        );
    }

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="px-5 pt-6 pb-8">
                <Link href="/admin" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">SH</span>
                    </div>
                    <div>
                        <p className="text-[15px] font-semibold text-gray-900 leading-tight">Shree Hari</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] font-medium">Admin Panel</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
                <p className="px-3 pt-1 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em]">Menu</p>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== "/admin");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-150 ${isActive
                                ? "bg-gray-900 text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                }`}
                        >
                            <item.icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} strokeWidth={isActive ? 2.2 : 1.8} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-3 mt-auto">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] font-medium text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-150"
                >
                    <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    Logout
                </button>
            </div>
        </>
    );

    return (
        <div data-admin className="h-screen bg-[#f5f6f8] flex overflow-hidden font-sans">
            {/* Desktop Sidebar — STICKY via fixed height + flex */}
            <aside className="hidden md:flex md:w-[240px] flex-col bg-white border-r border-gray-200/80 h-screen sticky top-0 flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="relative w-[260px] bg-white h-full flex flex-col shadow-2xl animate-slide-in-left">
                        <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-3 p-1.5 text-gray-400 hover:text-gray-600">
                            <X className="h-5 w-5" />
                        </button>
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Top Bar */}
                <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 z-10">
                    <button onClick={() => setMobileMenuOpen(true)} className="p-1.5 -ml-1 text-gray-600">
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-semibold text-gray-900">Shree Hari Admin</span>
                    <button onClick={handleSignOut} className="p-1.5 text-gray-400 hover:text-red-500">
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
