import { prisma } from "@/lib/db";
import { Users, Map, CreditCard, MessageSquare } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [
    clientCount,
    tripCount,
    registrationCount,
    pendingPayments,
    recentPayments,
    unreadMessages,
    pendingReviews,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.trip.count(),
    prisma.registration.count(),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { fullName: true } },
        registration: { include: { trip: { select: { title: true } } } },
      },
    }),
    prisma.message.count({ where: { read: false } }),
    prisma.review.count({ where: { approved: false } }),
  ]);

  const totalRevenue = await prisma.payment.aggregate({
    where: { status: "COMPLETED" },
    _sum: { amount: true },
  });

  const stats = [
    {
      label: "Total Clients",
      value: clientCount,
      icon: Users,
      href: "/admin/clients",
    },
    {
      label: "Active Trips",
      value: tripCount,
      icon: Map,
      href: "/admin/trips",
    },
    {
      label: "Registrations",
      value: registrationCount,
      icon: Users,
      href: "/admin/clients",
    },
    {
      label: "Pending Payments",
      value: pendingPayments,
      icon: CreditCard,
      href: "/admin/payments",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-wider mb-8">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white p-6 border border-neutral-200 hover:border-accent transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon size={20} className="text-neutral-400" />
              <span className="text-3xl font-bold">{stat.value}</span>
            </div>
            <p className="text-sm text-neutral-500 uppercase tracking-wider">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Revenue + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 border border-neutral-200">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-4">
            Revenue
          </h2>
          <p className="text-4xl font-bold text-green-600">
            ${(totalRevenue._sum.amount || 0).toLocaleString()}
          </p>
          <p className="text-sm text-neutral-500 mt-1">
            From completed payments
          </p>
        </div>
        <div className="bg-white p-6 border border-neutral-200">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-4">
            Needs Attention
          </h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/admin/messages"
              className="flex items-center justify-between text-sm hover:text-accent transition-colors"
            >
              <span className="flex items-center gap-2">
                <MessageSquare size={16} />
                Unread messages
              </span>
              <span className="font-bold">{unreadMessages}</span>
            </Link>
            <Link
              href="/admin/payments"
              className="flex items-center justify-between text-sm hover:text-accent transition-colors"
            >
              <span className="flex items-center gap-2">
                <CreditCard size={16} />
                Pending payments
              </span>
              <span className="font-bold">{pendingPayments}</span>
            </Link>
            <Link
              href="/admin/reviews"
              className="flex items-center justify-between text-sm hover:text-accent transition-colors"
            >
              <span className="flex items-center gap-2">
                <Users size={16} />
                Reviews to approve
              </span>
              <span className="font-bold">{pendingReviews}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-lg font-bold uppercase tracking-wider">
            Recent Payments
          </h2>
        </div>
        {recentPayments.length === 0 ? (
          <p className="p-6 text-neutral-500">No payments yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500 uppercase tracking-wider">
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Trip</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-neutral-100">
                  <td className="px-6 py-3 font-medium">
                    {payment.client.fullName}
                  </td>
                  <td className="px-6 py-3">
                    {payment.registration.trip.title}
                  </td>
                  <td className="px-6 py-3">
                    ${payment.amount.toLocaleString()}
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
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {payment.status}
                    </span>
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
