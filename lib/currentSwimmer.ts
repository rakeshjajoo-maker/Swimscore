import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SWIMMER_COOKIE = "swimmerId";

export async function getCurrentSwimmerId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SWIMMER_COOKIE)?.value ?? null;
}

export async function getCurrentSwimmer() {
  const id = await getCurrentSwimmerId();
  if (!id) return null;

  const swimmer = await prisma.swimmer.findUnique({ where: { id } });
  return swimmer;
}
