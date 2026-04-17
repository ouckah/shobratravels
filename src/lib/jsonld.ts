// JSON-LD builders for structured data. Keep shapes minimal — Google only
// cares about what it needs to render a rich result, and AI answer engines
// prefer short, fact-dense blocks.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.shobratravelagency.com";

const BUSINESS = {
  name: "Shobra Travel Agency",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  email: "shobratravels@gmail.com",
  telephone: "+1-201-618-2629",
  address: {
    "@type": "PostalAddress",
    streetAddress: "54 Colonial Way",
    addressLocality: "Short Hills",
    addressRegion: "NJ",
    postalCode: "07078",
    addressCountry: "US",
  },
  description:
    "Boutique travel agency curating cultural and historical group tours worldwide, based in Short Hills, New Jersey.",
};

export function travelAgencyLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${SITE_URL}#travelagency`,
    ...BUSINESS,
    areaServed: "Worldwide",
    priceRange: "$$$",
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name: BUSINESS.name,
    publisher: { "@id": `${SITE_URL}#travelagency` },
  };
}

export function touristTripLd(trip: {
  title: string;
  description: string;
  slug: string;
  destinations: string;
  duration: string;
  pricePerPerson: number;
  heroImage?: string | null;
  departures: Array<{ departureDate: Date; returnDate: Date }>;
}) {
  const url = `${SITE_URL}/trips/${trip.slug}`;
  const image = trip.heroImage || `${SITE_URL}/logo.png`;
  const offers = trip.departures.map((d) => ({
    "@type": "Offer",
    url,
    price: trip.pricePerPerson.toFixed(2),
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    validFrom: new Date().toISOString(),
    validThrough: d.departureDate.toISOString(),
    availabilityStarts: new Date().toISOString(),
    availabilityEnds: d.departureDate.toISOString(),
    category: d.departureDate.toISOString().slice(0, 10),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: trip.title,
    description: trip.description.slice(0, 500),
    url,
    image,
    touristType: "Cultural",
    itinerary: trip.destinations
      .split(/[,;]/)
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => ({ "@type": "Place", name: d })),
    provider: { "@id": `${SITE_URL}#travelagency` },
    offers:
      offers.length === 0
        ? undefined
        : offers.length === 1
        ? offers[0]
        : {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: trip.pricePerPerson.toFixed(2),
            highPrice: trip.pricePerPerson.toFixed(2),
            offerCount: offers.length,
            offers,
          },
  };
}

export function aggregateRatingLd(reviews: Array<{ rating: number }>) {
  if (reviews.length === 0) return null;
  const avg =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    itemReviewed: { "@id": `${SITE_URL}#travelagency` },
    ratingValue: avg.toFixed(1),
    reviewCount: reviews.length,
    bestRating: 5,
    worstRating: 1,
  };
}

export function breadcrumbLd(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

// Serialize safely for inline <script> tags.
export function jsonLdScript(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
