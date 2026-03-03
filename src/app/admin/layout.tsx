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
    LogOut
} from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    // Manage local UI auth state to prevent flicker
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // If we are on the login page, we don't need to be authorized to view it
        if (pathname === "/admin/login") {
            setIsChecking(false);
            return;
        }

        // Check our custom local storage auth flag
        const authState = localStorage.getItem("shreehari_admin_auth");

        if (authState === "true") {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
            router.push("/admin/login");
        }

        setIsChecking(false);
    }, [pathname, router]);

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

    // If we are on the login page itself, don't show the layout
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    // While checking or if unauthorized, do not render layout the layout yet (prevents flicker)
    if (isChecking || !isAuthorized) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-4 border-gold-200 border-t-gold-600 animate-spin"></div>
                    <p className="mt-4 text-gray-500 font-medium tracking-wide">Loading Admin Panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col pt-6 hidden md:flex">
                <div className="px-6 mb-8 mt-2">
                    <Link href="/admin" className="text-2xl font-playfair font-bold text-gray-900 tracking-wide">
                        Shree Hari <span className="text-gold-600 italic">Admin</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        // More exact match for the dashboard route to not highlight it on other routes
                        const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== "/admin");

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                    ? "bg-gold-50 text-gold-700 shadow-sm border border-gold-100"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-transform ${isActive ? "text-gold-600 scale-110" : "text-gray-400"
                                        }`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-gray-100">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Secure Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[#f8f9fa] relative">
                {/* Mobile header */}
                <header className="md:hidden bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm z-10 relative">
                    <Link href="/admin" className="text-xl font-playfair font-bold text-gray-900">
                        Shree Hari <span className="text-gold-600">Admin</span>
                    </Link>
                    <button onClick={handleSignOut} className="text-red-500 p-2">
                        <LogOut className="h-5 w-5" />
                    </button>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
