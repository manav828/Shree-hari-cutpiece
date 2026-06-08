export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastEventDetail {
    message: string;
    type: ToastType;
}

/**
 * Triggers a global toast notification in the admin panel.
 * Can be called from any client component or client-side callback.
 */
export function showToast(message: string, type: ToastType = "success") {
    if (typeof window !== "undefined") {
        const event = new CustomEvent("shreehari-toast", {
            detail: { message, type }
        });
        window.dispatchEvent(event);
    }
}
