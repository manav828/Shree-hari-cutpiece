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
  onSuccess: (orderNumber: string) => void;
  onError: (msg: string) => void;
  onSubmitting: (loading: boolean) => void;
}) {
  options.onSubmitting(true);
  try {
    const res = await fetch("/api/payments/cod/place-order", {
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

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Unable to place Cash on Delivery order.");
    }

    if (json.requiresAdvance) {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please check your connection and retry.");
      }

      const razorpayOptions = {
        key: json.keyId,
        amount: json.amount,
        currency: json.currency || "INR",
        name: "The Artisanal Archive",
        description: `COD Advance Payment ${json.orderNumber ? `(${json.orderNumber})` : ""}`,
        order_id: json.razorpayOrderId,
        prefill: {
          name: options.formData.fullName,
          email: options.formData.email || "",
          contact: options.formData.phone,
        },
        notes: {
          internal_order_id: json.internalOrderId,
          order_number: json.orderNumber || "",
          selected_method: "cod_advance",
        },
        theme: {
          color: "#9f3f29",
        },
        modal: {
          ondismiss: () => {
            options.onSubmitting(false);
            options.onError("Advance payment was cancelled. You can retry from checkout.");
          },
        },
        handler: async (response: any) => {
          try {
            options.onSubmitting(true);
            const verifyRes = await fetch("/api/payments/razorpay/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${options.accessToken}`,
              },
              body: JSON.stringify({
                internalOrderId: json.internalOrderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyJson = await verifyRes.json();
            if (!verifyRes.ok || !verifyJson.success) {
              throw new Error(verifyJson.error || "Partial payment verification failed.");
            }

            options.onSuccess(json.orderNumber || "");
          } catch (verifyError: any) {
            options.onError(verifyError.message || "Partial payment verification failed.");
          } finally {
            options.onSubmitting(false);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(razorpayOptions);
      razorpayInstance.on("payment.failed", (failRes: any) => {
        options.onSubmitting(false);
        options.onError(failRes.error?.description || "Advance payment failed. Please retry.");
      });
      razorpayInstance.open();
    } else {
      options.onSuccess(json.orderNumber || "");
      options.onSubmitting(false);
    }
  } catch (err: any) {
    options.onError(err.message || "Something went wrong while placing your order.");
    options.onSubmitting(false);
  }
}

