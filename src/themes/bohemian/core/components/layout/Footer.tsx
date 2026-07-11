import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { BOHEMIAN_SITE_CONTAINER } from "@/themes/bohemian/components/layout/siteStyles";
import { bohemianHeadingFont } from "@/themes/bohemian/components/layout/premiumFonts";

export default function BohemianFooter() {
	return (
		<footer className="w-full bg-stone-100">
			<div className={`${BOHEMIAN_SITE_CONTAINER} py-20`}>
				<div className="grid grid-cols-1 gap-12 md:grid-cols-4">
					<div>
						<span className={`${bohemianHeadingFont.className} mb-6 block text-xl text-[#9f3f29]`}>The Artisanal Archive</span>
						<p className="max-w-xs text-sm text-stone-600">
							© 2026 The Artisanal Archive. Curating warmth for the modern nomad.
						</p>
						<div className="mt-8 flex gap-4 text-[#9f3f29]">
							<Link href="#" aria-label="Facebook">
								<Facebook className="h-5 w-5" />
							</Link>
							<Link href="#" aria-label="Instagram">
								<Instagram className="h-5 w-5" />
							</Link>
							<Link href="#" aria-label="YouTube">
								<Youtube className="h-5 w-5" />
							</Link>
						</div>
					</div>

					<div>
						<h4 className={`${bohemianHeadingFont.className} mb-6 font-bold text-[#9f3f29]`}>Discover</h4>
						<ul className="space-y-4 text-sm text-stone-500">
							<li><Link href="#" className="underline decoration-[#9f3f29]/30 underline-offset-4">Journal</Link></li>
							<li><Link href="#" className="underline decoration-[#9f3f29]/30 underline-offset-4">Sustainability</Link></li>
							<li><Link href="#" className="underline decoration-[#9f3f29]/30 underline-offset-4">Wholesale</Link></li>
						</ul>
					</div>

					<div>
						<h4 className={`${bohemianHeadingFont.className} mb-6 font-bold text-[#9f3f29]`}>Support</h4>
						<ul className="space-y-4 text-sm text-stone-500">
							<li><Link href="/shipping-policy" prefetch={false} className="underline decoration-[#9f3f29]/30 underline-offset-4">Shipping & Returns</Link></li>
							<li><Link href="/privacy-policy" prefetch={false} className="underline decoration-[#9f3f29]/30 underline-offset-4">Privacy Policy</Link></li>
							<li><Link href="/contact" prefetch={false} className="underline decoration-[#9f3f29]/30 underline-offset-4">Contact Us</Link></li>
						</ul>
					</div>

					<div>
						<h4 className={`${bohemianHeadingFont.className} mb-6 font-bold text-[#9f3f29]`}>Our Ethos</h4>
						<p className="text-sm italic text-stone-600">
							&quot;We believe your home should be as intentional as the life you live.&quot;
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}