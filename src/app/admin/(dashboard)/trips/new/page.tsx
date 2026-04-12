import TripForm from "../TripForm";

export default function NewTripPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-wider mb-8">
        Create New Trip
      </h1>
      <TripForm />
    </div>
  );
}
