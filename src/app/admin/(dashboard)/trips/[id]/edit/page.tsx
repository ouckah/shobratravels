import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import TripForm from "../../TripForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditTripPage({ params }: Props) {
  const { id } = await params;
  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) notFound();

  const tripData = {
    id: trip.id,
    title: trip.title,
    slug: trip.slug,
    description: trip.description,
    destinations: trip.destinations,
    duration: trip.duration,
    departureDate: trip.departureDate.toISOString().split("T")[0],
    returnDate: trip.returnDate.toISOString().split("T")[0],
    groupSize: trip.groupSize || "",
    pricePerPerson: trip.pricePerPerson,
    singleSupplement: trip.singleSupplement || 0,
    inclusions: trip.inclusions || "",
    exclusions: trip.exclusions || "",
    heroImage: trip.heroImage || "",
    pdfUrl: trip.pdfUrl || "",
    published: trip.published,
    featured: trip.featured,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-wider mb-8">
        Edit Trip
      </h1>
      <TripForm trip={tripData} />
    </div>
  );
}
