import { Suspense } from "react";
import RegisterForm from "./RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Register for an upcoming Shobra Travel Agency tour.",
};

export default function RegisterPage() {
  return (
    <>
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider">
            Travel Registration
          </h1>
          <p className="text-neutral-400 mt-4 text-lg">
            Fill out the form below to reserve your spot. A deposit of $1,200
            per traveler is required.
          </p>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="py-20 text-center text-neutral-500">Loading...</div>
        }
      >
        <RegisterForm />
      </Suspense>
    </>
  );
}
