import { NextRequest } from "next/server";

type RateLimitRecord = {
    timestamps: number[];
};

const tracker = new Map<string, RateLimitRecord>();

// Cleanup stale records every 10 minutes to prevent memory leaks
if (typeof global !== "undefined") {
    const globalAny = global as any;
    if (!globalAny.rateLimitCleanupInterval) {
        globalAny.rateLimitCleanupInterval = setInterval(() => {
            const now = Date.now();
            const keysToDelete: string[] = [];
            tracker.forEach((record, key) => {
                const validTimestamps = record.timestamps.filter((t: number) => now - t < 3600000);
                if (validTimestamps.length === 0) {
                    keysToDelete.push(key);
                } else {
                    record.timestamps = validTimestamps;
                }
            });
            keysToDelete.forEach((key) => tracker.delete(key));
        }, 600000); // 10 minutes
    }
}

/**
 * Basic in-memory rate-limiter using client IP address.
 * 
 * @param req NextRequest
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Window size in milliseconds
 * @param actionKey Unique action name to segment rate limits (e.g. 'checkout')
 * @returns boolean true if rate limited, false otherwise
 */
export function isRateLimited(
    req: NextRequest,
    limit: number,
    windowMs: number,
    actionKey: string = "default"
): boolean {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    const trackingKey = `${actionKey}:${ip}`;
    const now = Date.now();

    let record = tracker.get(trackingKey);
    if (!record) {
        record = { timestamps: [] };
        tracker.set(trackingKey, record);
    }

    // Filter out timestamps older than the window
    record.timestamps = record.timestamps.filter((t: number) => now - t < windowMs);

    if (record.timestamps.length >= limit) {
        return true;
    }

    record.timestamps.push(now);
    return false;
}
