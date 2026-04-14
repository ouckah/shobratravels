import { prisma } from "@/lib/db";
import GalleryManager from "./GalleryManager";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const trips = await prisma.trip.findMany({
    orderBy: [{ archived: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      destinations: true,
      archived: true,
      galleryImages: true,
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-wider">Gallery</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Manage photos for each trip. Images shown here appear on the public
          gallery page, grouped by trip.
        </p>
      </div>

      {trips.length === 0 ? (
        <p className="bg-white border border-neutral-200 p-6 text-neutral-500">
          No trips yet. Create a trip first.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {trips.map((trip) => (
            <GalleryManager
              key={trip.id}
              tripId={trip.id}
              title={trip.title}
              destinations={trip.destinations}
              archived={trip.archived}
              initialImages={trip.galleryImages}
            />
          ))}
        </div>
      )}
    </div>
  );
}
