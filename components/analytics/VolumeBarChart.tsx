"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMeters } from "@/lib/format";

interface Point {
  weekStart: string; // ISO
  totalMeters: number;
}

export function VolumeBarChart({ data }: { data: Point[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.weekStart).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  }));

  return (
    <div className="bg-card rounded-xl border border-pool-100 p-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0f0f9" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#2b729d" }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11, fill: "#2b729d" }} width={44} />
          <Tooltip
            formatter={(value) => [formatMeters(Number(value)), "Meters"]}
            contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#bfe1f2" }}
          />
          <Bar dataKey="totalMeters" fill="#3a8fbf" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
