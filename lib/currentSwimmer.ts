import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SWIMMER_COOKIE = "swimmerId";

export async function getCurrentSwimmerId(): Promise<string | null> {
  const store = await cookies();
  const cookieId = store.get(SWIMMER_COOKIE)?.value;
  if (cookieId) return cookieId;

  // No cookie yet (fresh browser, or first visit ever) - fall back to the
  // first swimmer so single-swimmer usage works without an explicit pick.
  const first = await prisma.swimmer.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return first?.id ?? null;
}

export async function getCurrentSwimmer() {
  const id = await getCurrentSwimmerId();
  if (!id) return null;

  const swimmer = await prisma.swimmer.findUnique({ where: { id } });
  return swimmer;
}
