export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const initializePayment = (
  order: { id: string; amount: number; currency: string },
  prefill?: { name?: string; email?: string; contact?: string }
): Promise<RazorpayPaymentResult> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !(window as any).Razorpay) {
      reject(new Error("Razorpay SDK not loaded"));
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || "rzp_test_mockKey123",
      amount: order.amount,
      currency: order.currency,
      name: "HomeEvo Escrow",
      description: "Milestone Secure Escrow Payment",
      order_id: order.id,
      prefill: {
        name: prefill?.name || "",
        email: prefill?.email || "",
        contact: prefill?.contact || "",
      },
      theme: {
        color: "#E85D04", // HomeEvo primary brand accent orange
      },
      handler: (response: any) => {
        resolve({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => {
          reject(new Error("Payment cancelled by client"));
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  });
};
