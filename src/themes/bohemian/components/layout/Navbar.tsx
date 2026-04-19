import Link from "next/link";
import { CircleUserRound, Search, ShoppingBag } from "lucide-react";
import { BOHEMIAN_SITE_CONTAINER } from "@/themes/bohemian/components/layout/siteStyles";
import { bohemianHeadingFont } from "@/themes/bohemian/components/layout/premiumFonts";

type BohemianNavbarProps = {
	activePage?: "home" | "shop";
};

const navLinks = [
	{ label: "Collections", href: "/shop", page: "shop" as const },
	{ label: "New Arrivals", href: "/#new-arrivals" },
	{ label: "Our Story", href: "/#our-story" },
	{ label: "Journal", href: "/blogs" },
];

export default function BohemianNavbar({ activePage = "home" }: BohemianNavbarProps) {
	return (
		<header className="sticky top-0 z-50 border-b border-[#e8ddd3] bg-[#fcf9f4]/95 backdrop-blur-sm">
			<nav className={`${BOHEMIAN_SITE_CONTAINER} flex items-center justify-between py-4`}>
				<div className="flex items-center gap-8">
					<Link href="/" className={`${bohemianHeadingFont.className} text-[34px] font-semibold leading-none text-[#9f3f29]`}>
						The Artisanal Archive
					</Link>
				</div>

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

				<div className="flex items-center gap-2 text-[#9f3f29] sm:gap-3">
					<button aria-label="Search" className="transition-opacity hover:opacity-80">
						<Search className="h-[18px] w-[18px]" />
					</button>
					<button aria-label="Shopping bag" className="relative transition-opacity hover:opacity-80">
						<ShoppingBag className="h-[18px] w-[18px]" />
						<span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#9f3f29] px-1 text-[10px] leading-none text-white">
							0
						</span>
					</button>
					<Link
						href="/login"
						aria-label="Login or account"
						className="inline-flex items-center gap-2 rounded-full border border-[#e3d2c5] px-3 py-1.5 text-[12px] tracking-[0.08em] text-[#7f3321] transition-colors hover:bg-[#f3e7db]"
					>
						<CircleUserRound className="h-4 w-4" />
						<span className="hidden md:inline">Login</span>
					</Link>
					<Link
						href="/signup"
						className={`${bohemianHeadingFont.className} hidden rounded-full bg-[#9f3f29] px-4 py-2 text-sm leading-none text-white transition-colors hover:bg-[#8c3522] sm:inline-flex`}
					>
						Sign Up
					</Link>
				</div>
			</nav>
		</header>
	);
}