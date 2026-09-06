"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatRaceTime } from "@/lib/format";

export function SplitsChart({ splits }: { splits: number[] }) {
  const data = splits.map((seconds, i) => ({ split: `${i + 1}`, seconds }));

  return (
    <div className="h-32 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0f0f9" vertical={false} />
          <XAxis dataKey="split" tick={{ fontSize: 10, fill: "#2b729d" }} />
          <YAxis tick={{ fontSize: 10, fill: "#2b729d" }} width={36} />
          <Tooltip
            formatter={(value) => [formatRaceTime(Number(value)), "Split"]}
            contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#bfe1f2" }}
          />
          <Bar dataKey="seconds" fill="#3a8fbf" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
