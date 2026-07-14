type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    description?: string;
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color: string;
  };
  method?: {
    upi?: boolean;
    card?: boolean;
    netbanking?: boolean;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: RazorpayHandlerResponse) => void | Promise<void>;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", callback: (response: RazorpayFailureResponse) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function handleCheckout(options: {
  formData: any;
  items: any[];
  couponCode: string;
  accessToken: string;
  onSuccess: (orderNumber: string, orderId: string) => void;
  onError: (msg: string) => void;
  onSubmitting: (loading: boolean) => void;
  paymentSubOption?: string; // upi | card | netbanking
}) {
  options.onSubmitting(true);
  try {
    const res = await fetch("/api/payments/razorpay/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options.accessToken}`,
      },
      body: JSON.stringify({
        formData: options.formData,
        items: options.items,
        couponCode: options.couponCode,
      }),
    });

    const createJson = await res.json();
    if (!res.ok || !createJson.success || !createJson.razorpayOrderId || !createJson.keyId || !createJson.internalOrderId) {
      throw new Error(createJson.error || "Unable to initialize Razorpay payment.");
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      throw new Error("Razorpay SDK failed to load. Please check your connection and retry.");
    }

    const razorpayOptions: RazorpayOptions = {
      key: createJson.keyId,
      amount: createJson.amount,
      currency: createJson.currency || "INR",
      name: "The Artisanal Archive",
      description: `Secure Checkout ${createJson.orderNumber ? `(${createJson.orderNumber})` : ""}`,
      order_id: createJson.razorpayOrderId,
      prefill: {
        name: options.formData.fullName,
        email: options.formData.email || "",
        contact: options.formData.phone,
      },
      notes: {
        internal_order_id: createJson.internalOrderId,
        order_number: createJson.orderNumber || "",
        selected_method: options.paymentSubOption || "online",
      },
      theme: {
        color: "#9f3f29",
      },
      modal: {
        ondismiss: () => {
          options.onSubmitting(false);
          options.onError("Payment was cancelled. You can retry from checkout.");
        },
      },
      handler: async (response: RazorpayHandlerResponse) => {
        try {
          const verifyRes = await fetch("/api/payments/razorpay/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${options.accessToken}`,
            },
            body: JSON.stringify({
              internalOrderId: createJson.internalOrderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const verifyJson = await verifyRes.json();
          if (!verifyRes.ok || !verifyJson.success) {
            throw new Error(verifyJson.error || "Payment verification failed.");
          }

          options.onSuccess(createJson.orderNumber || "", verifyJson.orderId || createJson.internalOrderId || "");
        } catch (verifyError: any) {
          options.onError(verifyError.message || "Payment verification failed.");
        } finally {
          options.onSubmitting(false);
        }
      },
    };

    const razorpayInstance = new window.Razorpay(razorpayOptions);
    razorpayInstance.on("payment.failed", (failRes: RazorpayFailureResponse) => {
      options.onSubmitting(false);
      options.onError(failRes.error?.description || "Payment failed. Please retry.");
    });
    razorpayInstance.open();
  } catch (err: any) {
    options.onSubmitting(false);
    options.onError(err.message || "Unable to start payment.");
  }
}
