import { Star } from "lucide-react";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import ReviewForm from "./ReviewForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Read what our travelers have to say about their experiences.",
};

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider">
            Reviews
          </h1>
          <p className="text-neutral-400 mt-4 text-lg">
            Hear from travelers who have experienced our tours.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {reviews.length === 0 ? (
            <p className="text-center text-neutral-500 text-lg py-12">
              No reviews yet. Be the first!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-neutral-200 p-8"
                >
                  <div className="flex gap-1 text-gold mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                    {[...Array(5 - review.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-neutral-300" />
                    ))}
                  </div>
                  <p className="text-neutral-600 leading-relaxed mb-4 italic">
                    &ldquo;{review.content}&rdquo;
                  </p>
                  <p className="font-semibold uppercase tracking-wider text-sm">
                    {review.name}
                  </p>
                  <p className="text-neutral-400 text-xs mt-1">
                    {review.createdAt.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-center mb-8">
              Leave a Review
            </h2>
            <ReviewForm />
          </div>
        </div>
      </section>
    </>
  );
}
