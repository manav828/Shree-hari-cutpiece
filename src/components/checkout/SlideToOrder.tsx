"use client";

import { useState, useRef } from "react";

export default function SlideToOrder({
    onSubmit,
    isSubmitting,
}: {
    onSubmit: () => void;
    isSubmitting: boolean;
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragProgress, setDragProgress] = useState(0); // 0 to 1
    const [confirmed, setConfirmed] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const handleWidth = 60; // 60px wide handle

    const updateProgress = (clientX: number) => {
        if (!isDragging || !containerRef.current || confirmed || isSubmitting) return;

        const rect = containerRef.current.getBoundingClientRect();
        // Calculate the max distance the handle can move
        const maxDistance = rect.width - handleWidth;
        // Calculate the position of the finger/mouse relative to the starting point of the bar
        let position = clientX - rect.left - handleWidth / 2;

        if (position < 0) position = 0;
        if (position > maxDistance) position = maxDistance;

        const currentProgress = position / maxDistance;
        setDragProgress(currentProgress);

        // If it reaches the end, trigger confirm
        if (currentProgress >= 0.9) {
            setDragProgress(1);
            setConfirmed(true);
            setIsDragging(false);
            onSubmit();
        }
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (confirmed || isSubmitting) return;
        setIsDragging(true);
        // Optional: capture pointer to keep tracking if mouse leaves element bounds
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (isDragging) {
            updateProgress(e.clientX);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (isDragging) {
            setIsDragging(false);
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            if (!confirmed) {
                // Snap back to 0
                setDragProgress(0);
            }
        }
    };

    // Provide an initial subtle sliding animation cue to users before they interact
    const hasEverDragged = dragProgress > 0 || confirmed || isSubmitting;

    return (
        <div className="w-full relative py-2">
            <div
                ref={containerRef}
                className={`w-full h-16 rounded-full overflow-hidden relative flex items-center bg-accent/5 border border-accent/20 transition-colors duration-300 ${confirmed || isSubmitting ? 'bg-accent/10 border-accent' : ''}`}
                style={{
                    touchAction: 'none' // Prevent scrolling when sliding
                }}
            >
                {/* Background Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span className={`text-sm tracking-widest uppercase font-medium transition-opacity duration-300 ${dragProgress > 0.1 ? 'opacity-0' : 'opacity-100'} text-accent/80 ml-8`}>
                        {isSubmitting ? "Processing..." : confirmed ? "Order Confirmed" : "Slide to Place Order"}
                    </span>
                </div>

                {/* Progress Fill */}
                <div
                    className="absolute left-0 top-0 bottom-0 bg-accent/10 transition-all duration-300"
                    style={{
                        width: `${dragProgress * 100}%`,
                        transition: isDragging ? 'none' : 'width 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
                    }}
                />

                {/* Draggable Handle */}
                <div
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className={`absolute left-1 h-14 w-14 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-accent/90 shadow-md z-10 
            ${confirmed || isSubmitting ? 'bg-accent text-white pointer-events-none' : 'bg-accent text-white'}
            ${!hasEverDragged ? 'animate-slide-prompt' : ''}
          `}
                    style={{
                        transform: `translateX(calc(${dragProgress} * (100cqw - ${handleWidth + 8}px)))`,
                        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
                    }}
                >
                    {isSubmitting ? (
                        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    ) : confirmed ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}
