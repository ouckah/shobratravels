import { Suspense } from "react";
import RegisterForm from "./RegisterForm";
import type { Metadata } from "next";
import { Plane, Shield, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Register",
  description: "Register for an upcoming Shobra Travel Agency tour.",
};

export default function RegisterPage() {
  return (
    <>
      <section className="relative bg-primary text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <p className="text-accent-light text-sm uppercase tracking-[0.3em] mb-4">
            Begin Your Journey
          </p>
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-wider mb-6">
            Reserve Your
            <br />
            <span className="text-accent-light">Adventure</span>
          </h1>
          <p className="text-green-200/60 max-w-lg text-lg leading-relaxed">
            Complete the form below to secure your place on an upcoming tour.
            Secure your spot and pay online.
          </p>

          <div className="mt-12 flex flex-wrap gap-8 text-sm">
            {[
              { icon: Shield, text: "Secure payment processing" },
              { icon: Clock, text: "Instant confirmation" },
              { icon: Plane, text: "Fully guided experience" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-green-300/80">
                <Icon size={16} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="py-32 text-center text-neutral-400">
            <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent animate-spin" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </>
  );
}
