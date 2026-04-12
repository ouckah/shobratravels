"use client";

import { useRouter } from "next/navigation";

export default function MessageActions({ messageId }: { messageId: string }) {
  const router = useRouter();

  const markRead = async () => {
    await fetch(`/api/admin/messages/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    router.refresh();
  };

  return (
    <button
      onClick={markRead}
      className="text-sm text-neutral-500 hover:text-neutral-700"
    >
      Mark as Read
    </button>
  );
}
