"use client";

import Image from "next/image";
import { getThumbnailUrl } from "@/lib/imageOptimization";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { bohemianBodyFont, bohemianHeadingFont } from "@/themes/bohemian/components/layout/premiumFonts";
import { useUpsellProducts } from "@/hooks/useUpsellProducts";

const FREE_SHIPPING_THRESHOLD = 5000;

function buildItemMeta(item: {
	selected_options?: Array<{ group_name: string; value_labels?: string[]; input_value?: string | number }>;
	selling_mode: "meter" | "piece";
}): string {
	const selected = (item.selected_options || [])
		.map((option) => {
			if (option.value_labels && option.value_labels.length > 0) {
				return option.value_labels.join(", ");
			}
			if (option.input_value !== undefined && option.input_value !== null) {
				return String(option.input_value);
			}
			return "";
		})
		.filter(Boolean)
		.slice(0, 2);

	if (selected.length > 0) {
		return selected.join(" • ");
	}

	return item.selling_mode === "piece" ? "Piece item" : "Per meter cut";
}

export default function BohemianCartSidebar() {
	const {
		addToCart,
		items,
		removeFromCart,
		updateQuantity,
		totalPrice,
		isCartOpen,
		setIsCartOpen,
	} = useCart();
	const closeButtonRef = useRef<HTMLButtonElement | null>(null);
	const { products: upsellProducts, loading: upsellLoading } = useUpsellProducts(2);

	function handleUpsellQuickAdd(item: any) {
		addToCart({
			id: item.id,
			product_id: item.id,
			name: item.name,
			slug: item.slug,
			price: item.price,
			image: item.image,
			meters: item.selling_mode === "meter" ? 1.0 : 1,
			selling_mode: item.selling_mode,
			analytics_source: "bohemian_quick_cart_upsell",
		});
	}

	useEffect(() => {
		if (!isCartOpen) {
			return undefined;
		}

		const closeOnEsc = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsCartOpen(false);
			}
		};

		document.body.style.overflow = "hidden";
		closeButtonRef.current?.focus();
		window.addEventListener("keydown", closeOnEsc);

		return () => {
			document.body.style.overflow = "";
			window.removeEventListener("keydown", closeOnEsc);
		};
	}, [isCartOpen, setIsCartOpen]);

	const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - totalPrice, 0);
	const shippingProgress = useMemo(() => {
		if (FREE_SHIPPING_THRESHOLD <= 0) {
			return 100;
		}
		const ratio = (totalPrice / FREE_SHIPPING_THRESHOLD) * 100;
		return Math.max(0, Math.min(100, ratio));
	}, [totalPrice]);

	if (!isCartOpen) {
		return null;
	}

	return (
		<>
			<button
				type="button"
				aria-label="Close cart"
				className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
				onClick={() => setIsCartOpen(false)}
			/>

			<aside
				role="dialog"
				aria-modal="true"
				aria-labelledby="bohemian-cart-title"
				className={`${bohemianBodyFont.className} fixed right-0 top-0 z-[80] flex h-full w-full transform flex-col overflow-hidden rounded-l-[2rem] bg-[#fcf9f4] shadow-[-20px_0_40px_rgba(0,0,0,0.05)] transition duration-500 ease-out sm:w-[440px]`}
			>
				<div className="flex items-center justify-between border-b border-[#ddc0ba]/30 px-6 pb-4 pt-6">
					<div>
						<h2 id="bohemian-cart-title" className={`${bohemianHeadingFont.className} text-3xl italic text-[#9f3f29]`}>
							Your Archive
						</h2>
						<p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#6f645d]">
							{items.length} {items.length === 1 ? "item" : "items"}
						</p>
					</div>
					<button
						ref={closeButtonRef}
						type="button"
						onClick={() => setIsCartOpen(false)}
						className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ebe8e3] text-[#56423d] transition hover:bg-[#e5e2dd]"
						aria-label="Close cart drawer"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto px-6 py-5">
					{items.length === 0 ? (
						<div className="flex h-full flex-col items-center justify-center text-center">
							<h3 className={`${bohemianHeadingFont.className} text-2xl text-[#1c1c19]`}>Archive is empty</h3>
							<p className="mt-2 max-w-xs text-xs text-[#6f645d]">Add products with Quick Add and they will appear here instantly.</p>
							<button
								type="button"
								onClick={() => setIsCartOpen(false)}
								className="mt-6 rounded-lg bg-[#9f3f29] px-6 py-3 text-sm font-semibold text-white"
							>
								Continue Shopping
							</button>
						</div>
					) : (
						<div className="space-y-6">
							{items.map((item, index) => (
								<div key={item.id}>
									<div className="flex gap-3">
										<div className="h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#f0ede8]">
											<Image src={getThumbnailUrl(item.image)} alt={item.name} width={180} height={220} className="h-full w-full object-cover" />
										</div>

										<div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
											<div className="flex items-start justify-between gap-3">
												<div>
													<h3 className={`${bohemianHeadingFont.className} text-[23px] leading-[1.05] text-[#1c1c19]`}>{item.name}</h3>
													<p className="mt-1 text-[11px] text-[#6f645d]">{buildItemMeta(item)}</p>
												</div>
												<button
													type="button"
													onClick={() => removeFromCart(item.id)}
													className="mt-1 text-[#8a7d75] transition-colors hover:text-[#9f3f29]"
													aria-label={`Remove ${item.name}`}
												>
													<Trash2 className="h-3.5 w-3.5" />
												</button>
											</div>

											<div className="mt-3 flex items-end justify-between gap-3">
												{(() => {
													const isMeter = item.selling_mode === "meter";
													const step = isMeter ? 0.5 : 1;
													const minVal = isMeter ? 0.5 : 1;
													const isMin = item.meters <= minVal;
													return (
														<div className="flex items-center rounded-lg bg-[#f0ede8] p-1">
															<button
																type="button"
																disabled={isMin}
																onClick={() => {
																	if (!isMin) {
																		const nextVal = parseFloat((item.meters - step).toFixed(1));
																		updateQuantity(item.id, Math.max(minVal, nextVal));
																	}
																}}
																className={`flex h-6 w-6 items-center justify-center text-[#6f645d] hover:text-[#9f3f29] transition-opacity ${
																	isMin ? "opacity-30 cursor-not-allowed hover:text-[#6f645d]" : ""
																}`}
																aria-label={`Decrease quantity for ${item.name}`}
															>
																<Minus className="h-3.5 w-3.5" />
															</button>
															<span className="w-9 text-center text-xs font-semibold text-[#1c1c19]">
																{item.meters.toFixed(isMeter ? 1 : 0).replace(/\.0$/, "")}
																{isMeter ? "m" : ""}
															</span>
															<button
																type="button"
																onClick={() => {
																	const nextVal = parseFloat((item.meters + step).toFixed(1));
																	updateQuantity(item.id, nextVal);
																}}
																className="flex h-6 w-6 items-center justify-center text-[#6f645d] hover:text-[#9f3f29]"
																aria-label={`Increase quantity for ${item.name}`}
															>
																<Plus className="h-3.5 w-3.5" />
															</button>
														</div>
													);
												})()}

												<p className={`${bohemianHeadingFont.className} text-[24px] leading-none text-[#9f3f29]`}>
													{formatPrice(item.price * item.meters)}
												</p>
											</div>
										</div>
									</div>

									{index < items.length - 1 ? <div className="mt-5 h-px bg-[#ddc0ba]/25" /> : null}
								</div>
							))}

							{!upsellLoading && upsellProducts.length > 0 && (
								<div className="border-t border-[#ddc0ba]/25 pt-6">
									<h4 className={`${bohemianHeadingFont.className} text-[25px] italic text-[#5a6245]`}>Complete your space</h4>
									<div className="mt-3 grid grid-cols-2 gap-3">
										{upsellProducts.map((upsell) => (
											<article key={upsell.id} className="space-y-2">
												<div className="aspect-square overflow-hidden rounded-xl bg-[#f0ede8]">
													<Image src={getThumbnailUrl(upsell.image)} alt={upsell.name} width={280} height={280} className="h-full w-full object-cover" />
												</div>
												<p className="line-clamp-1 text-xs font-medium text-[#1c1c19]">{upsell.name}</p>
												<div className="flex items-center justify-between gap-2">
													<p className="text-xs text-[#6f645d]">{formatPrice(upsell.price)}</p>
													<button
														type="button"
														onClick={() => handleUpsellQuickAdd(upsell)}
														className="rounded-md border border-[#cbb8b0] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9f3f29] transition hover:bg-[#f0ede8]"
													>
														Quick Add
													</button>
												</div>
											</article>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				{items.length > 0 ? (
					<div className="space-y-4 bg-[#f6f3ee] px-6 pb-6 pt-5 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
						<div className="space-y-2.5">
							<div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6f645d]">
								<span>Free Shipping</span>
								<span className="text-[#9f3f29]">
									{remainingForFreeShipping > 0 ? `You're ${formatPrice(remainingForFreeShipping)} away` : "Unlocked"}
								</span>
							</div>
							<div className="h-1.5 overflow-hidden rounded-full bg-[#e5e2dd]">
								<div className="h-full rounded-full bg-[#9f3f29] transition-[width] duration-500" style={{ width: `${shippingProgress}%` }} />
							</div>
						</div>

						<div>
							<div className="flex items-end justify-between">
								<p className={`${bohemianHeadingFont.className} text-[26px] text-[#1c1c19]`}>Subtotal</p>
								<p className={`${bohemianHeadingFont.className} text-[30px] leading-none text-[#9f3f29]`}>{formatPrice(totalPrice)}</p>
							</div>
							<p className="mt-1 text-[11px] text-[#7a6f68]">Shipping and taxes calculated at checkout</p>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<Link
								href="/checkout"
								onClick={() => setIsCartOpen(false)}
								className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#9f3f29] px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-[0_14px_28px_rgba(159,63,41,0.2)] transition hover:bg-[#bf573f]"
							>
								Checkout Now
							</Link>

							<Link
								href="/cart"
								onClick={() => setIsCartOpen(false)}
								className="inline-flex w-full items-center justify-center rounded-lg border border-[#bca8a0] bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#1c1c19] transition hover:bg-[#ebe8e3]"
							>
								View Cart
							</Link>
						</div>
					</div>
				) : null}
			</aside>
		</>
	);
}