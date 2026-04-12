import { prisma } from "@/lib/db";
import { Mail, Phone } from "lucide-react";

export default async function AdminClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      registrations: {
        include: { trip: { select: { title: true } } },
      },
      payments: {
        select: { amount: true, status: true },
      },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-wider mb-8">
        Clients
      </h1>

      <div className="bg-white border border-neutral-200">
        {clients.length === 0 ? (
          <p className="p-6 text-neutral-500">No clients yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500 uppercase tracking-wider">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Trips</th>
                <th className="px-6 py-3">Total Paid</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const totalPaid = client.payments
                  .filter((p) => p.status === "COMPLETED")
                  .reduce((sum, p) => sum + p.amount, 0);

                return (
                  <tr key={client.id} className="border-b border-neutral-100">
                    <td className="px-6 py-3 font-medium">
                      {client.fullName}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-col gap-1 text-neutral-600">
                        <span className="flex items-center gap-1">
                          <Mail size={12} /> {client.email}
                        </span>
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} /> {client.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-col gap-1">
                        {client.registrations.map((reg) => (
                          <span key={reg.id} className="text-xs">
                            {reg.trip.title}
                          </span>
                        ))}
                        {client.registrations.length === 0 && (
                          <span className="text-neutral-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      {totalPaid > 0
                        ? `$${totalPaid.toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="px-6 py-3 text-neutral-500">
                      {client.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
