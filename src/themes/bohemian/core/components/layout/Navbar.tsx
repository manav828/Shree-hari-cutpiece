"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CircleUserRound, Search, ShoppingBag, Menu, X } from "lucide-react";
import { BOHEMIAN_SITE_CONTAINER } from "@/themes/bohemian/components/layout/siteStyles";
import { bohemianHeadingFont } from "@/themes/bohemian/components/layout/premiumFonts";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

type BohemianNavbarProps = {
	activePage?: "home" | "shop";
};

const navLinks = [
	{ label: "Shop", href: "/shop", page: "shop" as const },
	{ label: "About", href: "/about" },
	{ label: "Journal", href: "/blogs" },
];

export default function BohemianNavbar({ activePage = "home" }: BohemianNavbarProps) {
	const { user } = useAuth();
	const { totalItems, setIsCartOpen } = useCart();
	const router = useRouter();

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [siteName, setSiteName] = useState("The Artisanal Archive");

	useEffect(() => {
		fetch("/api/admin/settings/general")
			.then(res => res.json())
			.then(data => {
				if (data.websiteName) {
					setSiteName(data.websiteName);
				}
			})
			.catch(err => console.error("Error loading website name:", err));
	}, []);

	// Lock body scroll when mobile menu or search overlay is open
	useEffect(() => {
		if (isMobileMenuOpen || isSearchOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isMobileMenuOpen, isSearchOpen]);

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
			setIsSearchOpen(false);
			setSearchQuery("");
		}
	};

	return (
		<>
			<header className="sticky top-0 z-50 border-b border-[#e8ddd3] bg-[#fcf9f4]/95 backdrop-blur-sm">
				<nav className={`${BOHEMIAN_SITE_CONTAINER} flex items-center justify-between py-4`}>
					<div className="flex items-center gap-4">
						{/* Mobile hamburger menu button */}
						<button
							onClick={() => setIsMobileMenuOpen(true)}
							aria-label="Open menu"
							className="text-[#9f3f29] md:hidden transition-opacity hover:opacity-80 cursor-pointer"
						>
							<Menu className="h-6 w-6" />
						</button>

						<Link href="/" className={`${bohemianHeadingFont.className} text-[22px] sm:text-[27px] md:text-[34px] font-semibold leading-none text-[#9f3f29] whitespace-nowrap`}>
							{siteName}
						</Link>
					</div>

					{/* Desktop Navigation Links */}
					<div className="hidden items-center gap-8 md:flex">
						{navLinks.map((item) => {
							const isCurrent = item.page ? item.page === activePage : false;

							return (
								<Link
									key={item.label}
									href={item.href}
									aria-current={isCurrent ? "page" : undefined}
									className={`${bohemianHeadingFont.className} border-b border-transparent pb-1 text-[15px] text-[#544e49] transition-colors hover:text-[#9f3f29]`}
								>
									{item.label}
								</Link>
							);
						})}
					</div>

					{/* Action Buttons */}
					<div className="flex items-center gap-2 text-[#9f3f29] sm:gap-3">
						<button 
							onClick={() => setIsSearchOpen(true)}
							aria-label="Search" 
							className="transition-opacity hover:opacity-80 cursor-pointer"
						>
							<Search className="h-[18px] w-[18px]" />
						</button>
						<button 
							onClick={() => setIsCartOpen(true)}
							aria-label="Shopping bag" 
							className="relative transition-opacity hover:opacity-80 cursor-pointer"
						>
							<ShoppingBag className="h-[18px] w-[18px]" />
							{totalItems > 0 && (
								<span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#9f3f29] px-1 text-[10px] leading-none text-white font-medium">
									{totalItems}
								</span>
							)}
						</button>
						<Link
							href={user ? "/account" : "/login"}
							prefetch={false}
							aria-label="Login or account"
							className="inline-flex items-center gap-2 rounded-full border border-[#e3d2c5] px-3 py-1.5 text-[12px] tracking-[0.08em] text-[#7f3321] transition-colors hover:bg-[#f3e7db]"
						>
							<CircleUserRound className="h-4 w-4" />
							<span className="hidden md:inline">{user ? "Account" : "Login"}</span>
						</Link>
						{!user && (
							<Link
								href="/signup"
								prefetch={false}
								className={`${bohemianHeadingFont.className} hidden rounded-full bg-[#9f3f29] px-4 py-2 text-sm leading-none text-white transition-colors hover:bg-[#8c3522] sm:inline-flex`}
							>
								Sign Up
							</Link>
						)}
					</div>
				</nav>
			</header>

			{/* Mobile Sidebar Navigation Drawer */}
			{isMobileMenuOpen && (
				<div className="fixed inset-0 z-[100] flex md:hidden">
					{/* Backdrop */}
					<div 
						onClick={() => setIsMobileMenuOpen(false)}
						className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
					/>

					{/* Drawer Panel */}
					<aside className="relative flex w-4/5 max-w-[300px] flex-col bg-[#fcf9f4] p-6 shadow-2xl transition-transform duration-300">
						<div className="flex items-center justify-between border-b border-[#e8ddd3] pb-4">
							<span className={`${bohemianHeadingFont.className} text-lg font-semibold text-[#9f3f29]`}>Menu</span>
							<button 
								onClick={() => setIsMobileMenuOpen(false)}
								aria-label="Close menu"
								className="text-[#9f3f29] hover:opacity-80 cursor-pointer"
							>
								<X className="h-6 w-6" />
							</button>
						</div>

						{/* Links List */}
						<div className="mt-6 flex flex-col gap-4">
							{navLinks.map((item) => (
								<Link
									key={item.label}
									href={item.href}
									onClick={() => setIsMobileMenuOpen(false)}
									className={`${bohemianHeadingFont.className} text-lg text-[#544e49] hover:text-[#9f3f29] transition-colors`}
								>
									{item.label}
								</Link>
							))}
						</div>

						{/* Bottom account status/actions in Mobile Drawer */}
						<div className="mt-auto border-t border-[#e8ddd3] pt-6 flex flex-col gap-3">
							<Link
								href={user ? "/account" : "/login"}
								onClick={() => setIsMobileMenuOpen(false)}
								className={`${bohemianHeadingFont.className} flex items-center justify-center gap-2 rounded-lg border border-[#e3d2c5] py-2.5 text-sm text-[#7f3321] transition-colors hover:bg-[#f3e7db]`}
							>
								<CircleUserRound className="h-5 w-5" />
								<span>{user ? "My Account" : "Sign In"}</span>
							</Link>
							{!user && (
								<Link
									href="/signup"
									onClick={() => setIsMobileMenuOpen(false)}
									className={`${bohemianHeadingFont.className} flex items-center justify-center rounded-lg bg-[#9f3f29] py-2.5 text-sm text-white transition-colors hover:bg-[#8c3522]`}
								>
									Create Account
								</Link>
							)}
						</div>
					</aside>
				</div>
			)}

			{/* Search Modal Overlay */}
			{isSearchOpen && (
				<div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 backdrop-blur-xs pt-24 px-4">
					{/* Backdrop click to close */}
					<div 
						onClick={() => setIsSearchOpen(false)} 
						className="fixed inset-0 -z-10 cursor-default" 
					/>

					{/* Search Panel */}
					<div className="w-full max-w-xl rounded-xl bg-[#fcf9f4] p-6 shadow-2xl border border-[#e8ddd3]">
						<div className="flex items-center justify-between mb-4">
							<h3 className={`${bohemianHeadingFont.className} text-xl text-[#9f3f29]`}>Search Products</h3>
							<button 
								onClick={() => setIsSearchOpen(false)}
								aria-label="Close search"
								className="text-[#9f3f29] hover:opacity-80 cursor-pointer"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
						<form onSubmit={handleSearchSubmit} className="flex gap-2">
							<input
								type="text"
								autoFocus
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search for linen, tapestries, cushions..."
								className="h-11 flex-1 rounded-lg border border-[#e3d2c5] bg-[#ebe8e3]/40 px-4 text-sm text-[#1c1c19] focus:outline-none focus:ring-1 focus:ring-[#9f3f29]"
							/>
							<button
								type="submit"
								className="h-11 rounded-lg bg-[#9f3f29] px-6 text-sm font-semibold text-white hover:bg-[#8c3522] transition-colors cursor-pointer"
							>
								Search
							</button>
						</form>
					</div>
				</div>
			)}
		</>
	);
}