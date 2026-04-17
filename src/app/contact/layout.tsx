import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Shobra Travel Agency — call, email, or send us a message about upcoming tours, custom itineraries, and booking inquiries. Based in Short Hills, New Jersey.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact · Shobra Travel Agency",
    description:
      "Call, email, or send us a message about upcoming tours, custom itineraries, and booking inquiries.",
    url: "/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
