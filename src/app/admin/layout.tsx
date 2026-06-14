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
    X,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Mail,
    ChevronDown
} from "lucide-react";
import AdminCacheControls from "@/components/admin/layout/AdminCacheControls";
import AdminNotificationsBell from "@/components/admin/layout/AdminNotificationsBell";
import GlobalToastContainer from "@/components/admin/layout/GlobalToastContainer";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isCmsOpen, setIsCmsOpen] = useState(false);
    const [isProductsOpen, setIsProductsOpen] = useState(false);

    useEffect(() => {
        if (
            pathname.startsWith("/admin/blog") ||
            pathname.startsWith("/admin/notifications-templates") ||
            pathname.startsWith("/admin/cms")
        ) {
            setIsCmsOpen(true);
        }
        if (
            pathname.startsWith("/admin/products")
        ) {
            setIsProductsOpen(true);
        }
    }, [pathname]);

    useEffect(() => {
        const stored = localStorage.getItem("shreehari_admin_sidebar_collapsed");
        if (stored === "true") {
            setIsCollapsed(true);
        }
    }, []);

    const toggleSidebar = () => {
        const nextState = !isCollapsed;
        setIsCollapsed(nextState);
        localStorage.setItem("shreehari_admin_sidebar_collapsed", String(nextState));
    };

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
        {
            name: "Products",
            icon: Package,
            isGroup: true,
            isOpen: isProductsOpen,
            setOpen: setIsProductsOpen,
            subItems: [
                { name: "All Products", href: "/admin/products", icon: Package },
                { name: "Categories", href: "/admin/products/categories", icon: Layout },
                { name: "Stock Manager", href: "/admin/products/stock", icon: Settings },
                { name: "Customer Reviews", href: "/admin/products/reviews", icon: Users },
            ]
        },
        { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
        { name: "Customers", href: "/admin/customers", icon: Users },
        { name: "Coupons", href: "/admin/coupons", icon: Tags },
        {
            name: "Content Management",
            icon: Layout,
            isGroup: true,
            isOpen: isCmsOpen,
            setOpen: setIsCmsOpen,
            subItems: [
                { name: "Blog", href: "/admin/blog", icon: FileText },
                { name: "Notification Templates", href: "/admin/notifications-templates", icon: Mail },
                { name: "Banners & Content", href: "/admin/cms", icon: Layout },
            ]
        },
        { name: "Documentation", href: "/admin/documentation", icon: BookOpen },
        { name: "Reports", href: "/admin/reports", icon: BarChart },
        { name: "Payments", href: "/admin/payments", icon: CreditCard },
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

    const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
        const collapsed = isMobile ? false : isCollapsed;
        return (
            <>
                {/* Logo */}
                <div className={`px-4 pt-6 pb-8 border-b border-slate-700/70 flex transition-all duration-300 ${collapsed ? "flex-col items-center gap-4" : "items-center justify-between"}`}>
                    {!collapsed && (
                        <Link href="/admin" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-300 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-900/20">
                                <span className="text-slate-900 text-sm font-bold">SH</span>
                            </div>
                            <div>
                                <p className="text-[15px] font-semibold text-white leading-tight">Shree Hari</p>
                                <p className="text-[10px] text-slate-300 uppercase tracking-[0.15em] font-medium">Admin Panel</p>
                            </div>
                        </Link>
                    )}
                    {collapsed && (
                        <Link href="/admin" className="mx-auto transition-transform duration-300 hover:scale-105">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-300 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-900/20">
                                <span className="text-slate-900 text-sm font-bold">SH</span>
                            </div>
                        </Link>
                    )}
                    {!isMobile && (
                        <button
                            onClick={toggleSidebar}
                            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/55 cursor-pointer transition-colors ${collapsed ? "mt-1" : ""}`}
                            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-4 admin-sidebar-nav">
                    {!collapsed && <p className="px-3 pt-3 pb-2 text-[10px] font-semibold text-slate-300 uppercase tracking-[0.12em] select-none">Menu</p>}
                    {navItems.map((item: any) => {
                        if (item.isGroup) {
                            const hasActiveSub = item.subItems?.some((sub: any) => 
                                pathname === sub.href || (pathname.startsWith(`${sub.href}/`) && sub.href !== "/admin")
                            );
                            const currentCollapsed = isMobile ? false : isCollapsed;
                            return (
                                <div key={item.name} className="space-y-1">
                                    <button
                                        onClick={() => item.setOpen(!item.isOpen)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-150 ${
                                            currentCollapsed ? "justify-center px-0" : ""
                                        } ${hasActiveSub && !item.isOpen
                                            ? "bg-gradient-to-r from-cyan-300 to-blue-400 text-slate-900 font-semibold shadow-sm animate-pulse-subtle"
                                            : "text-slate-200 hover:text-white hover:bg-slate-700/70"
                                        }`}
                                        title={currentCollapsed ? item.name : undefined}
                                    >
                                        <item.icon className={`h-[18px] w-[18px] flex-shrink-0 ${hasActiveSub && !item.isOpen ? "text-slate-900" : "text-slate-300"}`} strokeWidth={1.8} />
                                        {!currentCollapsed && (
                                            <div className="flex-1 flex items-center justify-between text-left">
                                                <span>{item.name}</span>
                                                <ChevronDown className={`h-3 w-3 transform transition-transform duration-150 ${item.isOpen ? "rotate-180" : ""}`} />
                                            </div>
                                        )}
                                    </button>
                                    {item.isOpen && !currentCollapsed && (
                                        <div className="pl-6 space-y-1 mt-0.5">
                                            {item.subItems?.map((sub: any) => {
                                                const isSubActive = pathname === sub.href || (
                                                    sub.href === "/admin/products"
                                                        ? false
                                                        : (pathname.startsWith(`${sub.href}/`) && sub.href !== "/admin")
                                                );
                                                return (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        className={`flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium rounded-md transition-all duration-150 ${
                                                            isSubActive
                                                                ? "bg-gradient-to-r from-cyan-300/80 to-blue-400/80 text-slate-900 font-semibold shadow-sm"
                                                                : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                                                        }`}
                                                    >
                                                        <sub.icon className={`h-3.5 w-3.5 flex-shrink-0 ${isSubActive ? "text-slate-900" : "text-slate-400"}`} strokeWidth={isSubActive ? 2.2 : 1.8} />
                                                        <span>{sub.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== "/admin");
                        const currentCollapsed = isMobile ? false : isCollapsed;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-150 ${
                                    currentCollapsed ? "justify-center px-0" : ""
                                } ${isActive
                                    ? "bg-gradient-to-r from-cyan-300 to-blue-400 text-slate-900 shadow-md shadow-blue-900/20 font-semibold"
                                    : "text-slate-200 hover:text-white hover:bg-slate-700/70"
                                    }`}
                                title={currentCollapsed ? item.name : undefined}
                            >
                                <item.icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? "text-slate-900" : "text-slate-300"}`} strokeWidth={isActive ? 2.2 : 1.8} />
                                {!currentCollapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-3 mt-auto border-t border-slate-700/40">
                    <button
                        onClick={handleSignOut}
                        className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] font-medium text-slate-200 rounded-lg hover:bg-red-500/20 hover:text-red-200 transition-all duration-150 ${
                            collapsed ? "justify-center px-0" : ""
                        }`}
                        title={collapsed ? "Logout" : undefined}
                    >
                        <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </>
        );
    };

    return (
        <div data-admin className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex overflow-hidden font-sans">
            {/* Desktop Sidebar — STICKY via fixed height + flex */}
            <aside className={`hidden md:flex flex-col bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 border-r border-slate-700/80 h-screen sticky top-0 flex-shrink-0 shadow-xl transition-all duration-300 ${isCollapsed ? "w-[72px]" : "w-[252px]"}`}>
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
                        <SidebarContent isMobile={true} />
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
                    <div className="flex items-center gap-2">
                        <AdminNotificationsBell />
                        <AdminCacheControls />
                        <button onClick={handleSignOut} className="p-1.5 text-slate-400 hover:text-red-500">
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </header>

                {/* Desktop Top Bar — cache controls always visible */}
                <header className="hidden md:flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-blue-100 px-6 py-2.5 flex-shrink-0 z-10">
                    <p className="text-[12px] font-medium text-slate-400 tracking-wide">Shree Hari Admin Panel</p>
                    <div className="flex items-center gap-3">
                        <AdminNotificationsBell />
                        <AdminCacheControls />
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-5 md:px-10 py-6 md:py-8">
                        {children}
                    </div>
                </div>
            </main>
            <GlobalToastContainer />
            <style dangerouslySetInnerHTML={{ __html: `
                .admin-sidebar-nav::-webkit-scrollbar {
                    width: 4px;
                }
                .admin-sidebar-nav::-webkit-scrollbar-track {
                    background: transparent;
                }
                .admin-sidebar-nav::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 4px;
                }
                .admin-sidebar-nav::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
                .admin-sidebar-nav {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
                }
            `}} />
        </div>
    );
}
