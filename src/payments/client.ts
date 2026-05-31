// Central client-side payment gateway handler registry.
// Add or remove gateways here when installing/uninstalling payment method folders.
export const paymentClientHandlers: Record<string, () => Promise<{
  handleCheckout: (options: {
    formData: any;
    items: any[];
    couponCode: string;
    accessToken: string;
    onSuccess: (orderNumber: string) => void;
    onError: (msg: string) => void;
    onSubmitting: (loading: boolean) => void;
    paymentSubOption?: string;
  }) => Promise<void>;
}>> = {
  cod: () => import("./cod/client"),
  razorpay: () => import("./razorpay/client"),
};
