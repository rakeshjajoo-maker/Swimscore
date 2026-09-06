"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Point {
  weekStart: string; // ISO
  avgPreMood: number | null;
  avgPostMood: number | null;
}

export function MoodTrendChart({ data }: { data: Point[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.weekStart).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  }));

  return (
    <div className="bg-card rounded-xl border border-pool-100 p-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0f0f9" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#2b729d" }} interval="preserveStartEnd" />
          <YAxis domain={[1, 5]} tick={{ fontSize: 11, fill: "#2b729d" }} width={24} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#bfe1f2" }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="linear"
            dataKey="avgPreMood"
            name="Pre-session"
            stroke="#2b729d"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            type="linear"
            dataKey="avgPostMood"
            name="Post-session"
            stroke="#ff6b3d"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
