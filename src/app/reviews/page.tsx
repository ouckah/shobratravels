import { Star, Quote } from "lucide-react";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import ReviewForm from "./ReviewForm";
import { aggregateRatingLd, jsonLdScript } from "@/lib/jsonld";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Read first-hand reviews from Shobra Travel Agency clients — honest reflections on our cultural and historical small-group tours worldwide.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    title: "Reviews · Shobra Travel Agency",
    description:
      "Read first-hand reviews from Shobra Travel Agency clients on our cultural and historical small-group tours.",
    url: "/reviews",
  },
};

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
  });

  const rating = aggregateRatingLd(reviews);

  return (
    <>
      {rating && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(rating) }}
        />
      )}
      <section className="relative bg-primary text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <p className="text-accent-light text-sm uppercase tracking-[0.3em] mb-4">
            From Our Travelers
          </p>
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-wider">
            Reviews
          </h1>
          {reviews.length > 0 && (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="text-accent-light" fill="currentColor" />
                ))}
              </div>
              <span className="text-green-200/60 text-sm">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {reviews.length === 0 ? (
            <p className="text-center text-neutral-400 text-lg py-20">
              No reviews yet. Be the first to share your experience.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
              {reviews.map((review, i) => (
                <div
                  key={review.id}
                  className={`relative p-8 md:p-10 ${
                    i === 0
                      ? "md:col-span-2 bg-green-50 border border-green-200"
                      : "bg-white border border-neutral-200"
                  }`}
                >
                  <Quote
                    size={i === 0 ? 40 : 28}
                    className="text-accent/15 mb-5"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                  <p
                    className={`text-neutral-600 leading-relaxed mb-6 ${
                      i === 0 ? "text-lg md:text-xl md:max-w-3xl" : ""
                    }`}
                  >
                    {review.content}
                  </p>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="flex gap-0.5 text-accent mb-2">
                        {[...Array(review.rating)].map((_, j) => (
                          <Star key={j} size={13} fill="currentColor" />
                        ))}
                        {[...Array(5 - review.rating)].map((_, j) => (
                          <Star
                            key={j}
                            size={13}
                            className="text-neutral-200"
                          />
                        ))}
                      </div>
                      <p className="font-bold uppercase tracking-wider text-sm">
                        {review.name}
                      </p>
                    </div>
                    <p className="text-neutral-300 text-xs tracking-wider uppercase">
                      {review.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Review Form */}
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-accent text-sm uppercase tracking-[0.3em] mb-2">
                Share Your Experience
              </p>
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wider">
                Leave a Review
              </h2>
            </div>
            <ReviewForm />
          </div>
        </div>
      </section>
    </>
  );
}
