"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDate, formatRaceTime } from "@/lib/format";

interface BestTimePoint {
  date: string; // ISO
  timeSeconds: number;
  isPB: boolean;
  context: string;
}

export function BestTimeChart({ data }: { data: BestTimePoint[] }) {
  const chartData = data.map((d) => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="bg-card rounded-xl border border-pool-100 p-4 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0f0f9" />
          <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: "#2b729d" }} />
          <YAxis
            tick={{ fontSize: 11, fill: "#2b729d" }}
            tickFormatter={(value: number) => formatRaceTime(value)}
            width={56}
            domain={["dataMin - 1", "dataMax + 1"]}
          />
          <Tooltip
            formatter={(value) => [formatRaceTime(Number(value)), "Time"]}
            labelFormatter={(_label, payload) =>
              payload?.[0]
                ? `${formatDate(payload[0].payload.date)} · ${payload[0].payload.context}`
                : ""
            }
            contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#bfe1f2" }}
          />
          <Line
            type="monotone"
            dataKey="timeSeconds"
            stroke="#2b729d"
            strokeWidth={2}
            dot={(props: { cx?: number; cy?: number; payload?: BestTimePoint; index?: number }) => {
              const { cx, cy, payload, index } = props;
              return (
                <circle
                  key={`dot-${index}`}
                  cx={cx}
                  cy={cy}
                  r={payload?.isPB ? 5 : 3}
                  fill={payload?.isPB ? "#ff6b3d" : "#2b729d"}
                />
              );
            }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
