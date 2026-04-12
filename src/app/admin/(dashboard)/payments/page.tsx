import { prisma } from "@/lib/db";
import PaymentActions from "./PaymentActions";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { fullName: true, email: true } },
      registration: { include: { trip: { select: { title: true } } } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-wider mb-8">
        Payments
      </h1>

      <div className="bg-white border border-neutral-200">
        {payments.length === 0 ? (
          <p className="p-6 text-neutral-500">No payments yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500 uppercase tracking-wider">
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Trip</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Fee</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-neutral-100">
                  <td className="px-6 py-3">
                    <p className="font-medium">{payment.client.fullName}</p>
                    <p className="text-neutral-500 text-xs">
                      {payment.client.email}
                    </p>
                  </td>
                  <td className="px-6 py-3">
                    {payment.registration.trip.title}
                  </td>
                  <td className="px-6 py-3 capitalize">{payment.type.toLowerCase()}</td>
                  <td className="px-6 py-3">
                    ${payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-neutral-500">
                    ${payment.processingFee.toFixed(2)}
                  </td>
                  <td className="px-6 py-3 capitalize">
                    {payment.method.replace("_", " ")}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 text-xs uppercase tracking-wider ${
                        payment.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : payment.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : payment.status === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-neutral-500">
                    {payment.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-3">
                    <PaymentActions
                      paymentId={payment.id}
                      currentStatus={payment.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
