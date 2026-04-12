import { prisma } from "@/lib/db";
import MessageActions from "./MessageActions";

export default async function AdminMessagesPage() {
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-wider mb-8">
        Messages
      </h1>

      <div className="flex flex-col gap-4">
        {messages.length === 0 ? (
          <p className="text-neutral-500">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white border p-6 ${
                msg.read ? "border-neutral-200" : "border-accent"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium">{msg.name}</p>
                  <p className="text-sm text-neutral-500">{msg.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-400">
                    {msg.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {!msg.read && (
                    <span className="px-2 py-0.5 text-xs bg-accent text-white uppercase tracking-wider">
                      New
                    </span>
                  )}
                </div>
              </div>
              <p className="text-neutral-600 whitespace-pre-line">
                {msg.message}
              </p>
              <div className="mt-4 flex gap-3">
                {!msg.read && <MessageActions messageId={msg.id} />}
                <a
                  href={`mailto:${msg.email}`}
                  className="text-sm text-accent hover:underline"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
