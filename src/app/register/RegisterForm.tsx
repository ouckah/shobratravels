"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const [trips, setTrips] = useState<{ id: string; slug: string; title: string; departureDate: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    tripId: "",
    passportNumber: "",
    passportCountry: "",
    passportIssued: "",
    passportExpiry: "",
    passportIssuedBy: "",
    paymentMethod: "credit_card",
  });

  useEffect(() => {
    fetch("/api/trips")
      .then((r) => r.json())
      .then((data) => {
        setTrips(data);
        const tripSlug = searchParams.get("trip");
        if (tripSlug) {
          const match = data.find((t: { slug: string }) => t.slug === tripSlug);
          if (match) setForm((f) => ({ ...f, tripId: match.id }));
        }
      });
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  if (submitted) {
    return (
      <section className="py-20 md:py-32">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold uppercase tracking-wider mb-6">
            Registration Submitted
          </h1>
          <p className="text-neutral-600 text-lg mb-4">
            Thank you for registering! We&apos;ll follow up with payment details
            shortly.
          </p>
          {form.paymentMethod === "credit_card" && (
            <p className="text-neutral-500">
              A secure payment link will be sent to your email for the $1,200
              deposit (+ 3.9% processing fee).
            </p>
          )}
          {form.paymentMethod === "ach" && (
            <p className="text-neutral-500">
              A secure bank transfer link will be sent to your email for the
              $1,200 deposit (+ 1% processing fee).
            </p>
          )}
          {form.paymentMethod === "check" && (
            <p className="text-neutral-500">
              Please mail your check for $1,200 payable to &ldquo;SHOBRA TRAVEL
              AGENCY, LLC&rdquo; along with a copy of your passport to:
              <br />
              54 Colonial Way, Short Hills, NJ 07078
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider mb-6">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider mb-6">
              Trip Selection
            </h2>
            <label className="block text-sm font-medium mb-1">
              Select Tour *
            </label>
            <select
              required
              value={form.tripId}
              onChange={(e) => update("tripId", e.target.value)}
              className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent bg-white"
            >
              <option value="">Choose a trip...</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.title} — {new Date(trip.departureDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider mb-6">
              Passport Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Passport Number *
                </label>
                <input
                  type="text"
                  required
                  value={form.passportNumber}
                  onChange={(e) => update("passportNumber", e.target.value)}
                  className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={form.passportCountry}
                  onChange={(e) => update("passportCountry", e.target.value)}
                  className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date Issued *
                </label>
                <input
                  type="date"
                  required
                  value={form.passportIssued}
                  onChange={(e) => update("passportIssued", e.target.value)}
                  className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Expiration Date *
                </label>
                <input
                  type="date"
                  required
                  value={form.passportExpiry}
                  onChange={(e) => update("passportExpiry", e.target.value)}
                  className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Issued By *
                </label>
                <input
                  type="text"
                  required
                  value={form.passportIssuedBy}
                  onChange={(e) => update("passportIssuedBy", e.target.value)}
                  className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider mb-6">
              Payment Method
            </h2>
            <p className="text-neutral-600 text-sm mb-4">
              A deposit of <strong>$1,200.00</strong> per traveler is required
              upon registration.
            </p>
            <div className="flex flex-col gap-3">
              <label className="flex items-start gap-3 p-4 border border-neutral-300 cursor-pointer has-[:checked]:border-accent">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  checked={form.paymentMethod === "credit_card"}
                  onChange={(e) => update("paymentMethod", e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">Credit Card</p>
                  <p className="text-sm text-neutral-500">
                    Secure payment link via Square. 3.9% processing fee
                    applies ($1,246.80 total).
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-4 border border-neutral-300 cursor-pointer has-[:checked]:border-accent">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ach"
                  checked={form.paymentMethod === "ach"}
                  onChange={(e) => update("paymentMethod", e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">Bank Transfer (ACH)</p>
                  <p className="text-sm text-neutral-500">
                    Lower fee — only 1% processing ($1,212.00 total). Secure
                    link sent to your email.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-4 border border-neutral-300 cursor-pointer has-[:checked]:border-accent">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="check"
                  checked={form.paymentMethod === "check"}
                  onChange={(e) => update("paymentMethod", e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">Check</p>
                  <p className="text-sm text-neutral-500">
                    No processing fee. Mail check payable to &ldquo;SHOBRA
                    TRAVEL AGENCY, LLC&rdquo; with passport copy.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-accent hover:bg-accent-dark text-white font-semibold py-3 uppercase tracking-wider text-sm transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Registration"}
          </button>
        </form>
      </div>
    </section>
  );
}
