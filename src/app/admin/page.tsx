"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { 
    IndianRupee, 
    ShoppingBag, 
    Users, 
    Layers, 
    Activity,
    Info,
    Loader2,
    RefreshCw
} from "lucide-react";
import { fetchDashboardMetrics, DashboardMetricsResponse } from "@/app/actions/dashboardStats";
import { Table, TableBody, TableRow, TableCell } from "@/components/admin/ui/Table";

export default function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState<DashboardMetricsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetchDashboardMetrics();
                setDashboardData(res);
            } catch (err) {
                console.error("Failed to load dashboard metrics", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const res = await fetchDashboardMetrics();
            setDashboardData(res);
        } catch (err) {
            console.error("Failed to refresh metrics:", err);
        } finally {
            setRefreshing(false);
        }
    };

    const { liveStats, comparisons, chartData, disabledRlsTables } = dashboardData || {
        liveStats: { totalSales: 0, activeOrders: 0, totalProducts: 0, totalCustomers: 0 },
        comparisons: [],
        chartData: [],
        disabledRlsTables: []
    };

    const leftSide = useMemo(() => {
        const getMetric = (period: string) => comparisons.find(c => c.period === period) || { revenue: 0, orders: 0 };
        return [
            { label: "Today", data: getMetric("Today") },
            { label: "This Week", data: getMetric("This Week") },
            { label: "This Month", data: getMetric("This Month") },
            { label: "This Year", data: getMetric("This Year") }
        ];
    }, [comparisons]);

    const rightSide = useMemo(() => {
        const getMetric = (period: string) => comparisons.find(c => c.period === period) || { revenue: 0, orders: 0 };
        return [
            { label: "Yesterday", data: getMetric("Yesterday") },
            { label: "Last Week", data: getMetric("Last Week") },
            { label: "Last Month", data: getMetric("Last Month") },
            { label: "Last Year", data: getMetric("Last Year") }
        ];
    }, [comparisons]);
    // ─── SVG Chart Math ──────────────────────────────────────────────────────
    const svgWidth = 600;
    const svgHeight = 300;
    const margin = { top: 30, right: 55, bottom: 40, left: 65 };
    const plotWidth = svgWidth - margin.left - margin.right;
    const plotHeight = svgHeight - margin.top - margin.bottom;

    const { maxRevenue, maxOrders, revenuePoints, ordersPoints } = useMemo(() => {
        if (chartData.length === 0) {
            return { maxRevenue: 10000, maxOrders: 100, revenuePoints: [], ordersPoints: [] };
        }

        const maxRev = Math.max(...chartData.map(d => d.revenue), 10000);
        const maxOrd = Math.max(...chartData.map(d => d.orders), 100);

        // Add 15% padding so curves don't clip the top limit
        const scaleMaxRev = maxRev * 1.15;
        const scaleMaxOrd = maxOrd * 1.15;

        const xSpacing = plotWidth / (chartData.length - 1);

        const revPoints = chartData.map((d, i) => ({
            x: margin.left + i * xSpacing,
            y: svgHeight - margin.bottom - (d.revenue / scaleMaxRev) * plotHeight
        }));

        const ordPoints = chartData.map((d, i) => ({
            x: margin.left + i * xSpacing,
            y: svgHeight - margin.bottom - (d.orders / scaleMaxOrd) * plotHeight
        }));

        return {
            maxRevenue: scaleMaxRev,
            maxOrders: scaleMaxOrd,
            revenuePoints: revPoints,
            ordersPoints: ordPoints
        };
    }, [chartData, plotWidth, plotHeight, margin.left, margin.bottom, svgHeight]);

    // Cubic Bezier curve paths (snake paths)
    const buildBezierPath = (points: { x: number; y: number }[]) => {
        if (points.length === 0) return "";
        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const curr = points[i];
            const next = points[i + 1];
            const cpX1 = curr.x + (next.x - curr.x) * 0.45;
            const cpY1 = curr.y;
            const cpX2 = next.x - (next.x - curr.x) * 0.45;
            const cpY2 = next.y;
            path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
        }
        return path;
    };

    const buildAreaPath = (points: { x: number; y: number }[], bottomY: number) => {
        if (points.length === 0) return "";
        const linePath = buildBezierPath(points);
        return `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
    };

    const revenueLine = buildBezierPath(revenuePoints);
    const revenueArea = buildAreaPath(revenuePoints, svgHeight - margin.bottom);

    const ordersLine = buildBezierPath(ordersPoints);
    const ordersArea = buildAreaPath(ordersPoints, svgHeight - margin.bottom);

    // Mouse interactive tracking
    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current || chartData.length === 0) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left; // x coordinate relative to SVG
        const scaleX = svgWidth / rect.width;
        const targetX = (x * scaleX) - margin.left;
        
        const xSpacing = plotWidth / (chartData.length - 1);
        const index = Math.round(targetX / xSpacing);

        if (index >= 0 && index < chartData.length) {
            setHoveredIndex(index);
        } else {
            setHoveredIndex(null);
        }
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
    };

    if (loading && !dashboardData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Syncing live dashboard metrics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Security Notice for RLS Tables */}
            {disabledRlsTables && disabledRlsTables.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-xs">
                    <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-xs text-amber-800 space-y-1">
                        <span className="font-bold uppercase tracking-wider block">Security Advisory: RLS Disabled</span>
                        <p>
                            Row Level Security (RLS) is currently disabled on the following table{disabledRlsTables.length > 1 ? "s" : ""}:{" "}
                            {disabledRlsTables.map((t, idx) => (
                                <span key={t}>
                                    <strong className="font-mono">{t}</strong>
                                    {idx < disabledRlsTables.length - 1 ? ", " : ""}
                                </span>
                            ))}. To protect sensitive database records, it is highly recommended to enable RLS.
                        </p>
                    </div>
                </div>
            )}

            {/* Dashboard Header */}
            <div>
                <h1 className="text-2xl font-playfair font-bold text-gray-900 leading-tight">Admin Dashboard</h1>
                <p className="text-gray-500 text-xs mt-1">Welcome to the Shree Hari Admin Panel.</p>
            </div>

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
                {[
                    { 
                        title: "Total Sales", 
                        value: `₹${liveStats.totalSales.toLocaleString("en-IN")}`, 
                        icon: IndianRupee,
                        colorClass: "bg-indigo-50 text-indigo-700 border-indigo-100",
                        textColor: "text-indigo-900"
                    },
                    { 
                        title: "Active Orders", 
                        value: liveStats.activeOrders, 
                        icon: ShoppingBag,
                        colorClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
                        textColor: "text-emerald-900"
                    },
                    { 
                        title: "Total Products", 
                        value: liveStats.totalProducts, 
                        icon: Layers,
                        colorClass: "bg-amber-50 text-amber-700 border-amber-100",
                        textColor: "text-amber-900"
                    },
                    { 
                        title: "Customers", 
                        value: liveStats.totalCustomers, 
                        icon: Users,
                        colorClass: "bg-sky-50 text-sky-700 border-sky-100",
                        textColor: "text-sky-900"
                    },
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs transition-all hover:shadow-md flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.title}</h3>
                                <p className={`text-2xl font-black ${stat.textColor} tracking-tight`}>{stat.value}</p>
                            </div>
                            <div className={`p-3.5 rounded-xl border ${stat.colorClass} shrink-0`}>
                                <Icon className="w-5 h-5" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Visual Layout Grid (Table on Left, Line Chart on Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* 1. Performance Metrics Grid */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm lg:col-span-2 flex flex-col relative overflow-hidden">
                    {/* Loading Overlay */}
                    {(loading || refreshing) && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-30">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                <span className="text-[11px] text-slate-500 font-bold">Syncing live metrics...</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Title Header with Divider and Refresh Icon */}
                    <div className="flex items-center justify-between border-b border-gray-200 bg-white">
                        <div className="flex items-center gap-1.5 pl-5 py-3.5">
                            <span className="text-orange-500 font-bold text-lg leading-none">$</span>
                            <h3 className="font-sans font-medium text-[15px] text-[#5b80a0] leading-none">Sales Statistics</h3>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-4 border-l border-gray-200 bg-white hover:bg-slate-50 text-[#5b80a0] hover:text-[#45637d] transition-all cursor-pointer disabled:opacity-50 self-stretch flex items-center justify-center"
                            title="Refresh data"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        </button>
                    </div>

                    {/* Comparative Table Body */}
                    <div className="grow overflow-hidden">
                        <Table className="table-fixed text-xs border-0" wrapperClassName="border-0 rounded-none shadow-none">
                            <TableBody>
                                {leftSide.map((leftRow, idx) => {
                                    const rightRow = rightSide[idx];
                                    const isLastRow = idx === leftSide.length - 1;
                                    const rowBorderClass = isLastRow ? "" : "border-b border-slate-200";
                                    return (
                                        <TableRow key={idx} className={`${rowBorderClass} hover:bg-transparent`}>
                                            {/* Left Side Label */}
                                            <TableCell className="w-[20%] bg-[#f4f7f9] text-[#5b80a0] font-medium text-[12.5px] text-center py-3.5 border-r border-slate-200 select-none">
                                                {leftRow.label}
                                            </TableCell>
                                            {/* Left Side Value */}
                                            <TableCell className="w-[30%] bg-white p-3 pl-4.5 border-r border-slate-200 text-left">
                                                <div className="text-[13.5px] font-semibold text-slate-800">
                                                    ₹ {leftRow.data.revenue.toFixed(2)}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                                                    ({leftRow.data.orders} Orders)
                                                </div>
                                            </TableCell>
                                            {/* Right Side Label */}
                                            <TableCell className="w-[20%] bg-[#f4f7f9] text-[#5b80a0] font-medium text-[12.5px] text-center py-3.5 border-r border-slate-200 select-none">
                                                {rightRow.label}
                                            </TableCell>
                                            {/* Right Side Value */}
                                            <TableCell className="w-[30%] bg-white p-3 pl-4.5 text-left">
                                                <div className="text-[13.5px] font-semibold text-slate-800">
                                                    ₹ {rightRow.data.revenue.toFixed(2)}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                                                    ({rightRow.data.orders} Orders)
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>


                {/* 2. Interactive SVG Snake Graph */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-3 flex flex-col justify-between relative overflow-hidden">
                    {/* Loading Overlay */}
                    {loading && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-30">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                <span className="text-[11px] text-slate-500 font-bold">Syncing trend graph...</span>
                            </div>
                        </div>
                    )}
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-gray-100">
                            <div>
                                <h3 className="font-playfair font-bold text-base text-gray-900">Revenue &amp; Orders Trend</h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">Smooth snake plotting in a monthly frame ({chartData.length > 0 ? `${chartData[0].label} to ${chartData[chartData.length - 1].label}` : ""})</p>
                            </div>
                            
                            {/* Line Legends */}
                            <div className="flex items-center gap-4 text-xs font-bold">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                                    <span className="text-gray-700">Revenue (₹)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                    <span className="text-gray-700">Order Count</span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Graph Box */}
                        <div className="relative mt-6 select-none">
                            {chartData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[240px] text-gray-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    <Activity className="w-8 h-8 text-slate-300 animate-pulse mb-2" />
                                    <p className="text-xs">No chart data available for selected range</p>
                                </div>
                            ) : (
                                <svg
                                    ref={svgRef}
                                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                                    className="w-full h-auto overflow-visible cursor-crosshair"
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <defs>
                                        {/* Revenue Fill Gradient */}
                                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.22" />
                                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
                                        </linearGradient>
                                        
                                        {/* Orders Fill Gradient */}
                                        <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                                        </linearGradient>
                                    </defs>

                                    {/* Horizontal Grid lines */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                                        const y = margin.top + ratio * plotHeight;
                                        return (
                                            <line
                                                key={index}
                                                x1={margin.left}
                                                y1={y}
                                                x2={svgWidth - margin.right}
                                                y2={y}
                                                stroke="#f1f5f9"
                                                strokeWidth="1.2"
                                                strokeDasharray={index === 4 ? "0" : "4 4"}
                                            />
                                        );
                                    })}

                                    {/* Left Y Axis Labels */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                                        const y = margin.top + (1 - ratio) * plotHeight;
                                        const val = (maxRevenue * ratio);
                                        let label = "";
                                        
                                        if (val >= 100000) {
                                            label = `₹${(val / 100000).toFixed(1)}L`;
                                        } else if (val >= 1000) {
                                            label = `₹${(val / 1000).toFixed(0)}k`;
                                        } else {
                                            label = `₹${val.toFixed(0)}`;
                                        }

                                        return (
                                            <text
                                                key={index}
                                                x={margin.left - 12}
                                                y={y + 4}
                                                textAnchor="end"
                                                className="fill-slate-400 font-bold text-[9px] font-sans"
                                            >
                                                {label}
                                            </text>
                                        );
                                    })}

                                    {/* Right Y Axis Labels */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                                        const y = margin.top + (1 - ratio) * plotHeight;
                                        const val = Math.round(maxOrders * ratio);
                                        return (
                                            <text
                                                key={index}
                                                x={svgWidth - margin.right + 12}
                                                y={y + 4}
                                                textAnchor="start"
                                                className="fill-slate-400 font-bold text-[9px] font-sans"
                                            >
                                                {val}
                                            </text>
                                        );
                                    })}

                                    {/* X Axis Month Labels (Show all 13 months, no skipping) */}
                                    {chartData.map((d, i) => {
                                        const x = margin.left + i * (plotWidth / (chartData.length - 1));
                                        return (
                                            <text
                                                key={i}
                                                x={x}
                                                y={svgHeight - margin.bottom + 18}
                                                textAnchor="middle"
                                                className="fill-slate-400 font-bold text-[8.5px] font-sans"
                                            >
                                                {d.label}
                                            </text>
                                        );
                                    })}

                                    {/* Revenue Curved Snake Line & Area Fill */}
                                    <path d={revenueArea} fill="url(#revenueGrad)" />
                                    <path
                                        d={revenueLine}
                                        fill="none"
                                        stroke="#4f46e5"
                                        strokeWidth="2.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />

                                    {/* Orders Curved Snake Line & Area Fill */}
                                    <path d={ordersArea} fill="url(#ordersGrad)" />
                                    <path
                                        d={ordersLine}
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="2.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />

                                    {/* Hover states tracking cursor */}
                                    {hoveredIndex !== null && (
                                        <>
                                            {/* Cursor Vertical Tracking line */}
                                            <line
                                                x1={revenuePoints[hoveredIndex].x}
                                                y1={margin.top}
                                                x2={revenuePoints[hoveredIndex].x}
                                                y2={svgHeight - margin.bottom}
                                                stroke="#cbd5e1"
                                                strokeWidth="1.5"
                                                strokeDasharray="3 3"
                                            />
                                            
                                            {/* Hover Circle on Revenue line */}
                                            <circle
                                                cx={revenuePoints[hoveredIndex].x}
                                                cy={revenuePoints[hoveredIndex].y}
                                                r="6.5"
                                                fill="#ffffff"
                                                stroke="#4f46e5"
                                                strokeWidth="3"
                                                className="drop-shadow-sm transition-all"
                                            />

                                            {/* Hover Circle on Orders line */}
                                            <circle
                                                cx={ordersPoints[hoveredIndex].x}
                                                cy={ordersPoints[hoveredIndex].y}
                                                r="6.5"
                                                fill="#ffffff"
                                                stroke="#10b981"
                                                strokeWidth="3"
                                                className="drop-shadow-sm transition-all"
                                            />
                                        </>
                                    )}
                                </svg>
                            )}

                            {/* Floating HTML Tooltip overlay triggered by hoveredIndex */}
                            {hoveredIndex !== null && chartData[hoveredIndex] && (
                                <div 
                                    className="absolute bg-slate-900 border border-slate-800 text-white rounded-lg p-3 shadow-xl pointer-events-none text-xs flex flex-col gap-1 z-20 animate-fadeIn"
                                    style={{
                                        left: `${(revenuePoints[hoveredIndex].x / svgWidth) * 100}%`,
                                        top: `${Math.min(revenuePoints[hoveredIndex].y, ordersPoints[hoveredIndex].y) - 85}px`,
                                        transform: "translateX(-50%)",
                                        minWidth: "140px"
                                    }}
                                >
                                    <span className="font-bold border-b border-slate-800 pb-1 text-slate-300 block">
                                        {chartData[hoveredIndex].label}
                                    </span>
                                    <div className="flex items-center justify-between gap-4 mt-1">
                                        <span className="text-slate-400">Revenue:</span>
                                        <span className="font-bold text-indigo-300">
                                            ₹{chartData[hoveredIndex].revenue.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-slate-400">Orders:</span>
                                        <span className="font-bold text-emerald-400">
                                            {chartData[hoveredIndex].orders}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 text-[10px] text-slate-400 font-bold flex items-center justify-between">
                        <span>Graph Type: Cubic Bezier (Snake Line)</span>
                        <span>Axis: Double Y (Revenue Left / Orders Right)</span>
                    </div>
                </div>
            </div>

            {/* Bottom Grid for Orders and Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="font-playfair font-bold text-lg mb-4 text-gray-900">Recent Orders</h3>
                    <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">No recent orders found</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="font-playfair font-bold text-lg mb-4 text-gray-900">Low Stock Alerts</h3>
                    <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">Inventory is healthy</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
