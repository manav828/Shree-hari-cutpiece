import Link from "next/link";
import { Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#151515] text-white pt-24 pb-12">
            <div className="max-w-[1600px] mx-auto px-6 md:px-12">

                {/* Newsletter Subscription */}
                <div className="flex flex-col items-center justify-center border-b border-white/10 pb-24 mb-16 text-center">
                    <Mail className="text-[#D4AF37] w-6 h-6 mb-6" />
                    <h3 className="font-playfair text-3xl md:text-4xl italic mb-4">Journal Subscription</h3>
                    <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-8">
                        Exclusive access to limited edition pieces and private views.
                    </p>
                    <div className="flex w-full max-w-md">
                        <input
                            type="email"
                            placeholder="EMAIL ADDRESS"
                            className="bg-transparent border border-white/20 text-white text-xs px-6 py-4 w-full outline-none focus:border-[#D4AF37] transition-colors tracking-widest"
                        />
                        <button className="bg-white text-black text-xs font-semibold uppercase tracking-widest px-8 py-4 ml-4 hover:bg-gray-200 transition-colors">
                            Join
                        </button>
                    </div>
                </div>

                {/* Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12 xl:gap-8 mb-16">
                    {/* Brand */}
                    <div className="xl:col-span-1">
                        <Link href="/" className="block mb-6 font-serif text-lg tracking-[0.3em]">
                            <span className="font-light">SHREE</span> HARI
                        </Link>
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest leading-relaxed max-w-xs">
                            The definitive standard in interior architecture and curated furniture design.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 col-span-3 gap-8">
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-white">Inquiries</h4>
                            <ul className="space-y-4 text-[10px] uppercase tracking-widest text-gray-500">
                                <li><Link href="/contact" className="hover:text-white transition-colors">Press</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition-colors">Contract</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition-colors">Wholesale</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-white">Support</h4>
                            <ul className="space-y-4 text-[10px] uppercase tracking-widest text-gray-500">
                                <li><Link href="#" className="hover:text-white transition-colors">Shipping</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Returns</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Care Guide</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-white">Global</h4>
                            <ul className="space-y-4 text-[10px] uppercase tracking-widest text-gray-500">
                                <li><span className="hover:text-white transition-colors cursor-default">Milan</span></li>
                                <li><span className="hover:text-white transition-colors cursor-default">Paris</span></li>
                                <li><span className="hover:text-white transition-colors cursor-default">New York</span></li>
                                <li><span className="hover:text-white transition-colors cursor-default">Tokyo</span></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] uppercase tracking-[0.2em] text-gray-600">
                    <p>&copy; {new Date().getFullYear()} SHREE HARI. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-white transition-colors">Instagram</Link>
                        <Link href="#" className="hover:text-white transition-colors">Pinterest</Link>
                        <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
