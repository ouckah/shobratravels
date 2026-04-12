"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function AdminLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 text-sm text-neutral-400 hover:text-white transition-colors w-full"
    >
      <LogOut size={18} />
      Sign Out
    </button>
  );
}
