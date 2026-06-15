"use client";

import React, { useState, useEffect } from "react";
import { Scissors, Ruler, Sparkles, AlertCircle, Info, ChevronRight, Check } from "lucide-react";

interface FabricCalculatorProps {
    isModal?: boolean;
    onClose?: () => void;
    onApply?: (meters: number) => void;
}

const PRESETS = [
    { id: "salwar_kameez", name: "Salwar Kameez / Kurta", description: "Standard Indian suit set", baseMeters: 2.5 },
    { id: "saree", name: "Saree", description: "Standard single drape piece", baseMeters: 5.5 },
    { id: "anarkali", name: "Anarkali Suit", description: "Flared traditional ethnic suit", baseMeters: 4.5 },
    { id: "lehenga", name: "Lehenga Choli", description: "Skirt and blouse ensemble", baseMeters: 4.0 },
    { id: "blouse", name: "Blouse / Crop Top", description: "Fitted short upper wear", baseMeters: 1.0 },
    { id: "shirt", name: "Shirt (Men's)", description: "Standard full sleeve shirt", baseMeters: 2.0 },
    { id: "trousers", name: "Trousers (Men's)", description: "Formal/Casual long trousers", baseMeters: 1.3 },
    { id: "sherwani", name: "Sherwani", description: "Traditional long coat structure", baseMeters: 3.5 },
    { id: "custom", name: "Custom Project", description: "Specify your own yardage request", baseMeters: 0.0 },
];

const WIDTHS = [
    { id: "narrow", name: "36\" (Narrow Width / Panna)", description: "Common for vintage fabrics & narrow silks", multiplier: 1.25 },
    { id: "standard", name: "44\" (Standard Width / Panna)", description: "Most common width for apparel cotton & prints", multiplier: 1.0 },
    { id: "wide", name: "58\"/60\" (Wide Width / Panna)", description: "Common for suitings, linen & drapery fabric", multiplier: 0.8 },
];

const SIZES = [
    { id: "xs_s", name: "XS - S", description: "Slim/Petite frame (Approx size 32-36)", multiplier: 0.9 },
    { id: "m", name: "Medium (M)", description: "Standard fit (Approx size 38-40)", multiplier: 1.0 },
    { id: "l", name: "Large (L)", description: "Slightly relaxed fit (Approx size 42-44)", multiplier: 1.1 },
    { id: "xl", name: "Extra Large (XL)", description: "Generous fit (Approx size 46-48)", multiplier: 1.2 },
    { id: "xxl_plus", name: "XXL+", description: "Plus sizing (Approx size 50+)", multiplier: 1.35 },
];

export default function FabricCalculator({ isModal = false, onClose, onApply }: FabricCalculatorProps) {
    const [selectedPreset, setSelectedPreset] = useState(PRESETS[0].id);
    const [customMeters, setCustomMeters] = useState("2.0");
    const [selectedWidth, setSelectedWidth] = useState("standard");
    const [selectedSize, setSelectedSize] = useState("m");

    const [rawMeters, setRawMeters] = useState(0);
    const [totalMeters, setTotalMeters] = useState(0);

    useEffect(() => {
        const preset = PRESETS.find(p => p.id === selectedPreset);
        if (!preset) return;

        let base = preset.baseMeters;
        if (preset.id === "custom") {
            const parsed = parseFloat(customMeters);
            base = isNaN(parsed) ? 0 : parsed;
        }

        const widthObj = WIDTHS.find(w => w.id === selectedWidth);
        const sizeObj = SIZES.find(s => s.id === selectedSize);

        const widthMult = widthObj ? widthObj.multiplier : 1.0;
        const sizeMult = sizeObj ? sizeObj.multiplier : 1.0;

        const calculatedRaw = base * widthMult * sizeMult;
        // Round UP to the nearest 0.5 meters
        const calculatedTotal = Math.max(0.5, Math.ceil(calculatedRaw * 2) / 2);

        setRawMeters(calculatedRaw);
        setTotalMeters(calculatedTotal);
    }, [selectedPreset, customMeters, selectedWidth, selectedSize]);

    const handleApply = () => {
        if (onApply) {
            onApply(totalMeters);
        }
        if (onClose) {
            onClose();
        }
    };

    const containerClasses = isModal
        ? "bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-2xl w-full mx-auto relative border border-border animate-in fade-in zoom-in-95 duration-200"
        : "bg-white p-6 md:p-8 rounded-2xl border border-border shadow-sm max-w-3xl mx-auto";

    return (
        <div className={containerClasses}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-accent/10 p-2.5 rounded-xl text-accent">
                        <Scissors className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-serif text-xl md:text-2xl text-foreground">Fabric Requirement Calculator</h2>
                        <p className="text-xs text-text-secondary">Calculate required meters based on garment & width</p>
                    </div>
                </div>
                {isModal && onClose && (
                    <button
                        onClick={onClose}
                        className="text-text-secondary hover:text-foreground text-sm font-medium hover:bg-background-secondary px-3 py-1.5 rounded-lg transition-all"
                    >
                        Close
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                {/* Inputs */}
                <div className="md:col-span-7 space-y-6">
                    {/* Step 1: Garment Preset */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                            1. Select Garment Type
                        </label>
                        <select
                            value={selectedPreset}
                            onChange={(e) => setSelectedPreset(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        >
                            {PRESETS.map(preset => (
                                <option key={preset.id} value={preset.id}>
                                    {preset.name} {preset.baseMeters > 0 ? `(Base: ${preset.baseMeters}m)` : ""}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-text-secondary mt-1 ml-1">
                            {PRESETS.find(p => p.id === selectedPreset)?.description}
                        </p>
                    </div>

                    {/* Custom Meters Input (Only if Custom Project is selected) */}
                    {selectedPreset === "custom" && (
                        <div className="animate-in slide-in-from-top-2 duration-150">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                                Base Meters Needed
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.5"
                                    value={customMeters}
                                    onChange={(e) => setCustomMeters(e.target.value)}
                                    className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                                    placeholder="e.g. 2.5"
                                />
                                <span className="text-sm font-medium text-text-secondary">Meters</span>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Fabric Width Selector */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                            2. Fabric Width (Panna)
                        </label>
                        <div className="space-y-2">
                            {WIDTHS.map(width => (
                                <label
                                    key={width.id}
                                    className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all hover:bg-background-secondary ${
                                        selectedWidth === width.id
                                            ? "border-accent bg-accent/[0.02] ring-1 ring-accent"
                                            : "border-border bg-white"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="fabric-width"
                                        checked={selectedWidth === width.id}
                                        onChange={() => setSelectedWidth(width.id)}
                                        className="sr-only"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-foreground">{width.name}</span>
                                            {selectedWidth === width.id && <Check className="w-4 h-4 text-accent" />}
                                        </div>
                                        <p className="text-xs text-text-secondary mt-0.5">{width.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Step 3: Size Modifier */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                            3. Select Size Group
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {SIZES.map(size => (
                                <button
                                    key={size.id}
                                    type="button"
                                    onClick={() => setSelectedSize(size.id)}
                                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                                        selectedSize === size.id
                                            ? "border-accent bg-accent text-white"
                                            : "border-border bg-white hover:bg-background-secondary text-text-secondary hover:text-foreground"
                                    }`}
                                    title={size.description}
                                >
                                    {size.name}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-text-secondary mt-2 ml-1 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-text-secondary" />
                            {SIZES.find(s => s.id === selectedSize)?.description}
                        </p>
                    </div>
                </div>

                {/* Results Screen */}
                <div className="md:col-span-5 flex flex-col justify-between">
                    <div className="bg-background-secondary rounded-2xl p-6 border border-border space-y-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Estimate Summary</h3>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Base Garment Need</span>
                                <span className="font-semibold text-foreground">
                                    {PRESETS.find(p => p.id === selectedPreset)?.name === "Custom Project"
                                        ? `${parseFloat(customMeters) || 0}m`
                                        : `${PRESETS.find(p => p.id === selectedPreset)?.baseMeters}m`
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Width Adjuster</span>
                                <span className="font-semibold text-foreground">
                                    {WIDTHS.find(w => w.id === selectedWidth)?.name.split(" ")[0]} ({WIDTHS.find(w => w.id === selectedWidth)?.multiplier}x)
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Size Adjuster</span>
                                <span className="font-semibold text-foreground">
                                    {SIZES.find(s => s.id === selectedSize)?.name} ({SIZES.find(s => s.id === selectedSize)?.multiplier}x)
                                </span>
                            </div>
                            
                            <div className="border-t border-border pt-4">
                                <div className="text-xs text-text-secondary mb-1">Raw Calculated Fabric</div>
                                <div className="text-sm font-medium text-foreground">{rawMeters.toFixed(2)} meters</div>
                            </div>

                            <div className="border-t border-border pt-4 bg-accent/[0.01] -mx-4 px-4 pb-2 rounded-xl">
                                <div className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5" /> Recommended Cut Length
                                </div>
                                <div className="text-4xl font-serif text-accent mt-1.5 flex items-baseline gap-1">
                                    {totalMeters.toFixed(1)}
                                    <span className="text-lg font-sans font-medium text-accent">meters</span>
                                </div>
                                <p className="text-[10px] text-text-secondary mt-1">
                                    * Rounded up to the nearest 0.5m interval to ensure you have enough fabric for seam allowances.
                                </p>
                            </div>
                        </div>

                        {/* Apply Button */}
                        {onApply && (
                            <button
                                onClick={handleApply}
                                className="w-full mt-4 bg-accent hover:bg-accent/90 text-white font-medium py-3 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                Apply {totalMeters.toFixed(1)}m to Selection <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="mt-4 md:mt-0 p-4 border border-amber-200 bg-amber-50 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p>
                            Disclaimer: This is a general estimate. Complex patterns, large prints requiring matching, or specific custom designer cuts may require extra yardage. Please consult your tailor if unsure.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
