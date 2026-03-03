"use client";

export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-playfair font-bold text-gray-900 mb-6">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome to the Shree Hari Admin Panel.</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                {[
                    { title: "Total Sales", value: "₹0" },
                    { title: "Active Orders", value: "0" },
                    { title: "Total Products", value: "0" },
                    { title: "Customers", value: "0" },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="font-playfair font-bold text-lg mb-4">Recent Orders</h3>
                    <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">No recent orders found</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="font-playfair font-bold text-lg mb-4">Low Stock Alerts</h3>
                    <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">Inventory is healthy</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
