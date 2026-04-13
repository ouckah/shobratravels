"use client";

import { useState } from "react";
import { Calendar, X } from "lucide-react";
import BookingForm from "@/components/BookingForm";

type TripData = {
  id: string;
  title: string;
  slug: string;
  pricePerPerson: number;
  singleSupplement: number | null;
  dates: { id: string; departureDate: string; returnDate: string }[];
};

export default function TripBooking({ trip }: { trip: TripData }) {
  const [selectedDateId, setSelectedDateId] = useState(
    trip.dates[0]?.id || ""
  );
  const [booking, setBooking] = useState(false);

  const selectedDate = trip.dates.find((d) => d.id === selectedDateId);

  if (booking && selectedDate) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Book This Trip
          </h3>
          <button
            onClick={() => setBooking(false)}
            className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <BookingForm
          tripId={trip.id}
          tripDateId={selectedDateId}
          tripTitle={trip.title}
          tripPrice={trip.pricePerPerson}
          departureDate={selectedDate.departureDate}
          returnDate={selectedDate.returnDate}
          onClose={() => setBooking(false)}
        />
      </div>
    );
  }

  return (
    <div>
      {trip.dates.length > 1 && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
            Select Date
          </p>
          <div className="flex flex-col gap-2">
            {trip.dates.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDateId(d.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm border transition-all w-full text-left ${
                  selectedDateId === d.id
                    ? "border-accent bg-accent text-white"
                    : "border-neutral-300 hover:border-neutral-400"
                }`}
              >
                <Calendar size={13} />
                {new Date(d.departureDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                –{" "}
                {new Date(d.returnDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setBooking(true)}
        disabled={!selectedDateId}
        className="w-full bg-accent hover:bg-accent-dark text-white text-center font-semibold py-3 uppercase tracking-wider text-sm transition-colors disabled:opacity-40"
      >
        Book Now
      </button>
    </div>
  );
}
