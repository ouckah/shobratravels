"use client";

import { useRouter } from "next/navigation";

type Props = {
  tripSlug: string;
  dateCount: number;
};

export default function TripBooking({ tripSlug, dateCount }: Props) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/trips/${tripSlug}/book`)}
      className="w-full bg-accent hover:bg-accent-dark text-white text-center font-semibold py-3 uppercase tracking-wider text-sm transition-colors"
    >
      Book Now{dateCount > 0 ? ` — ${dateCount} ${dateCount === 1 ? "date" : "dates"} available` : ""}
    </button>
  );
}
