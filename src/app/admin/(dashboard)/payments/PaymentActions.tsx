"use client";

import { useRouter } from "next/navigation";

export default function PaymentActions({
  paymentId,
  currentStatus,
}: {
  paymentId: string;
  currentStatus: string;
}) {
  const router = useRouter();

  const updateStatus = async (status: string) => {
    await fetch(`/api/admin/payments/${paymentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  };

  if (currentStatus === "COMPLETED") return null;

  return (
    <div className="flex gap-2">
      {currentStatus === "PENDING" && (
        <button
          onClick={() => updateStatus("COMPLETED")}
          className="text-xs text-green-600 hover:underline"
        >
          Mark Paid
        </button>
      )}
    </div>
  );
}
