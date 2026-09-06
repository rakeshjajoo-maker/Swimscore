"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { switchSwimmer } from "@/app/actions";

const ADD_NEW = "__add_new__";

export function SwimmerPicker({
  swimmers,
  currentId,
}: {
  swimmers: { id: string; name: string }[];
  currentId: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={currentId ?? ""}
      disabled={isPending}
      onChange={(e) => {
        const id = e.target.value;
        if (id === ADD_NEW) {
          router.push("/swimmers/new");
          return;
        }
        startTransition(async () => {
          await switchSwimmer(id);
          router.refresh();
        });
      }}
      className="rounded-lg border border-pool-300 bg-white/90 text-pool-900 text-sm font-medium px-2 py-1.5 max-w-[45vw]"
    >
      {!currentId && (
        <option value="" disabled>
          Select swimmer
        </option>
      )}
      {swimmers.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
      <option value={ADD_NEW}>+ Add swimmer</option>
    </select>
  );
}
