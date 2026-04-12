import Link from "next/link";
import { MapPin, Calendar, Users, Star } from "lucide-react";

const features = [
  {
    title: "Elevated Experiences",
    description:
      "Your needs and desires are unique, and we believe you deserve to work with a travel company that can guide you through designing and executing extraordinary experiences. When you partner with us, you will work directly with our team of expert advisors to create fully customized itineraries.",
    icon: Star,
  },
  {
    title: "Custom Itineraries",
    description:
      "If you seek unique travel experiences that capture the essence of a destination, immersing you in the culture and connecting you with local customs and traditions, our itineraries will excite and inspire.",
    icon: MapPin,
  },
  {
    title: "Trusted Travel Partners",
    description:
      "We have partnered with the best hotels and local tour operators to give you the best trip of your life. We, together with our network of partners, make sure that you get the best deals and have that seamless and fun travel experience.",
    icon: Users,
  },
  {
    title: "VIP Treatment",
    description:
      "To provide you with unmatched service and design incredible trips, we work exclusively with trusted and highly vetted suppliers worldwide. We maintain a strong commitment to eco-stewardship and responsible travel experiences.",
    icon: Calendar,
  },
];

const testimonials = [
  {
    name: "Corazon Baltazar Calalang",
    quote:
      "Thank you very much to Tessie Peralta for arranging a boutique tour — small group, first class accommodations and authentic dining experiences. Super grateful for the memories made with family and new friends that will last forever.",
  },
  {
    name: "Delia Aguinaldo",
    quote:
      "I have traveled with Shobra Travel Agency spearheaded by Ms. Teresita Peralta and the most I can say is that we got the best accommodations and have seen beautiful historical, cultural and spiritual places unexpectedly.",
  },
  {
    name: "Dinah Lewkowicz",
    quote:
      "A well curated journey, a well balanced travel that cater to older clients. The places we have been to has a lot of archeological, historical and biblical sites. To me, these are priceless. Absolutely beautiful places.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-primary text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920&q=80')",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48">
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-wider mb-6">
            Discover the World&apos;s
            <br />
            Most Incredible
            <br />
            Destinations
          </h1>
          <p className="text-lg md:text-xl text-green-200/80 max-w-2xl mb-10 leading-relaxed">
            Are you a discerning traveler seeking to explore and discover the
            world&apos;s most incredible destinations? Stop settling for plain
            uninspired vacations. Discover how our boutique travel experiences
            curated specifically for YOU will transform your travels.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/trips"
              className="bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-3 uppercase tracking-wider text-sm transition-colors"
            >
              View All Trips
            </Link>
            <Link
              href="/register"
              className="border border-white hover:bg-white hover:text-primary px-8 py-3 uppercase tracking-wider text-sm transition-colors"
            >
              Register Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-center mb-16">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-5">
                <div className="shrink-0">
                  <div className="w-12 h-12 bg-primary text-accent-light flex items-center justify-center rounded-lg">
                    <feature.icon size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wider mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wider mb-6">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-green-200/70 mb-10 text-lg">
            Fill out the registration form to reserve your spot on one of our
            upcoming trips. A deposit of $1,200 per traveler is required to
            secure your booking.
          </p>
          <Link
            href="/register"
            className="inline-block bg-accent hover:bg-accent-dark text-white font-semibold px-10 py-4 uppercase tracking-wider text-sm transition-colors"
          >
            Register Now
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-center mb-16">
            What Our Travelers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white p-8 border border-green-200 rounded-lg"
              >
                <div className="flex gap-1 text-accent mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-neutral-600 leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="font-semibold uppercase tracking-wider text-sm">
                  {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
