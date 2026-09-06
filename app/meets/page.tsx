import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSwimmerId } from "@/lib/currentSwimmer";
import { formatDate } from "@/lib/format";
import type { MeetEvent } from "@/lib/types";

export default async function MeetsPage() {
  const swimmerId = await getCurrentSwimmerId();
  if (!swimmerId) redirect("/swimmers/new");

  const meets = await prisma.meet.findMany({
    where: { swimmerId },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-pool-900">Meets</h1>
        <Link
          href="/meets/new"
          className="rounded-lg bg-coral-500 hover:bg-coral-600 text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          + New Meet
        </Link>
      </div>

      {meets.length === 0 ? (
        <p className="text-sm text-pool-600">No meets logged yet. Add your first one above.</p>
      ) : (
        <ul className="space-y-2">
          {meets.map((meet) => {
            const events = (meet.events as unknown as MeetEvent[]) ?? [];
            const resultsIn = events.filter((e) => e.actualTimeSeconds != null).length;
            return (
              <li key={meet.id}>
                <Link
                  href={`/meets/${meet.id}`}
                  className="block bg-card rounded-lg border border-pool-100 p-3 hover:border-pool-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-pool-900 text-sm">{meet.name}</span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-pool-500">
                      {formatDate(meet.date)}
                    </span>
                  </div>
                  <p className="text-sm text-pool-700 mt-1">
                    {events.length} event{events.length === 1 ? "" : "s"}
                    {events.length > 0 ? ` · ${resultsIn} with results` : ""}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
