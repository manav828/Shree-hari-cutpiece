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

    options.onSuccess(json.orderNumber || "");
  } catch (err: any) {
    options.onError(err.message || "Something went wrong while placing your order.");
  } finally {
    options.onSubmitting(false);
  }
}
