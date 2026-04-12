import { prisma } from "@/lib/db";
import { Star } from "lucide-react";
import ReviewActions from "./ReviewActions";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-wider mb-8">
        Reviews
      </h1>

      <div className="flex flex-col gap-4">
        {reviews.length === 0 ? (
          <p className="text-neutral-500">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white border p-6 ${
                review.approved ? "border-neutral-200" : "border-yellow-300"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium">{review.name}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className="text-accent fill-accent"
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-400">
                    {review.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs uppercase tracking-wider ${
                      review.approved
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {review.approved ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>
              <p className="text-neutral-600 italic">
                &ldquo;{review.content}&rdquo;
              </p>
              <div className="mt-4">
                <ReviewActions
                  reviewId={review.id}
                  approved={review.approved}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
