"use client";

import { useRouter } from "next/navigation";

export default function ReviewActions({
  reviewId,
  approved,
}: {
  reviewId: string;
  approved: boolean;
}) {
  const router = useRouter();

  const updateReview = async (action: "approve" | "reject" | "delete") => {
    await fetch(`/api/admin/reviews/${reviewId}`, {
      method: action === "delete" ? "DELETE" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: action === "approve" }),
    });
    router.refresh();
  };

  return (
    <div className="flex gap-3">
      {!approved && (
        <button
          onClick={() => updateReview("approve")}
          className="text-sm text-green-600 hover:underline"
        >
          Approve
        </button>
      )}
      {approved && (
        <button
          onClick={() => updateReview("reject")}
          className="text-sm text-yellow-600 hover:underline"
        >
          Unapprove
        </button>
      )}
      <button
        onClick={() => updateReview("delete")}
        className="text-sm text-red-600 hover:underline"
      >
        Delete
      </button>
    </div>
  );
}
