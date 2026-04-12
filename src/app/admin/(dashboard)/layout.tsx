import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import {
  LayoutDashboard,
  Map,
  Users,
  CreditCard,
  MessageSquare,
  Star,
  LogOut,
} from "lucide-react";
import AdminLogout from "./AdminLogout";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/trips", label: "Trips", icon: Map },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <aside className="w-64 bg-primary text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="font-bold uppercase tracking-wider text-sm">
            Shobra Admin
          </h2>
          <p className="text-neutral-500 text-xs mt-1">{admin.name}</p>
        </div>
        <nav className="flex-1 py-4">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-6 py-3 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-neutral-800">
          <AdminLogout />
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
