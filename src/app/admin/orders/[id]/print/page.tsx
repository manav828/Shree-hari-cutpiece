import { fetchOrderById } from "@/lib/orders";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import PrintButton from "./PrintButton";

export default async function PrintOrderPage({ params }: { params: { id: string } }) {
    const order = await fetchOrderById(params.id);
    if (!order) return notFound();

    const address = order.shipping_address;

    return (
        <div className="bg-white text-black min-h-screen font-sans p-8 print:p-0 max-w-3xl mx-auto">
            <div className="flex justify-between items-start mb-8 print:mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-serif tracking-tight">SHREE HARI</h1>
                    <p className="text-gray-500 text-sm mt-1">Premium Fabrics & Cutpieces</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold uppercase tracking-wider text-gray-800">Order Invoice</h2>
                    <p className="text-sm font-medium mt-1">#{order.order_number}</p>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="flex gap-12 mb-8 print:mb-6 border-b border-gray-200 pb-8 print:pb-6">
                <div className="flex-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ship To</h3>
                    <p className="font-semibold text-lg">{address?.full_name || order.delivery_address?.split(',')[0] || "Customer"}</p>
                    <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                        {address?.address_line1 || order.delivery_address}
                        {address?.city ? `\n${address.city}, ${address.state} ${address.pincode}` : ''}
                    </p>
                    <p className="text-gray-600 mt-2 font-medium">T: {address?.phone || order.contact_phone}</p>
                </div>
            </div>

            <table className="w-full text-sm mb-8 print:mb-6">
                <thead>
                    <tr className="border-b-2 border-gray-900 text-left">
                        <th className="py-2 font-bold uppercase tracking-wider text-xs text-gray-600">Item</th>
                        <th className="py-2 text-center font-bold uppercase tracking-wider text-xs text-gray-600">Qty/Meters</th>
                        <th className="py-2 text-right font-bold uppercase tracking-wider text-xs text-gray-600">Rate</th>
                        <th className="py-2 text-right font-bold uppercase tracking-wider text-xs text-gray-600">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {order.items.map((item, idx) => (
                        <tr key={idx}>
                            <td className="py-3 pr-4">
                                <p className="font-medium text-gray-900">{item.product_name}</p>
                                {item.color_name && <p className="text-xs text-gray-500 mt-0.5">Color: {item.color_name}</p>}
                            </td>
                            <td className="py-3 text-center text-gray-700">{item.quantity_or_meters}</td>
                            <td className="py-3 text-right text-gray-700">{formatPrice(item.price_per_unit)}</td>
                            <td className="py-3 text-right font-medium text-gray-900">{formatPrice(item.price_per_unit * item.quantity_or_meters)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end mb-12 print:mb-8">
                <div className="w-64 space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatPrice(order.total_amount - (order.shipping_cost || 0))}</span>
                    </div>
                    {(order.shipping_cost || 0) > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Shipping</span>
                            <span>{formatPrice(order.shipping_cost || 0)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-3">
                        <span>Total</span>
                        <span>{formatPrice(order.total_amount)}</span>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-gray-400 mt-16 print:mt-auto pt-8 border-t border-gray-100">
                <p>Thank you for shopping with Shree Hari.</p>
                <p>For any queries, please reach out to our support team.</p>
            </div>

            <div className="print:hidden fixed bottom-8 right-8">
                <PrintButton />
            </div>
        </div>
    );
}
