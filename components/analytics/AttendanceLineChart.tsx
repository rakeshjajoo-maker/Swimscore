"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Point {
  weekStart: string; // ISO
  attendanceRate: number | null;
}

export function AttendanceLineChart({ data }: { data: Point[] }) {
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
          <YAxis
            tick={{ fontSize: 11, fill: "#2b729d" }}
            width={40}
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            formatter={(value) => [value == null ? "No sessions" : `${Math.round(Number(value))}%`, "Attendance"]}
            contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#bfe1f2" }}
          />
          <Line
            type="linear"
            dataKey="attendanceRate"
            stroke="#2b729d"
            strokeWidth={2}
            dot={{ r: 3, fill: "#2b729d", strokeWidth: 0 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
