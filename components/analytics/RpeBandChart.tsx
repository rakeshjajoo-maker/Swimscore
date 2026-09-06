"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Point {
  setType: string;
  actualAvg: number | null;
  expectedMin: number;
  expectedMax: number;
}

export function RpeBandChart({ data }: { data: Point[] }) {
  const chartData = data.map((d) => ({
    setType: d.setType,
    expectedMin: d.expectedMin,
    expectedRange: d.expectedMax - d.expectedMin,
    expectedMax: d.expectedMax,
    actualAvg: d.actualAvg,
  }));

  return (
    <div className="bg-card rounded-xl border border-pool-100 p-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0f0f9" vertical={false} />
            <XAxis dataKey="setType" tick={{ fontSize: 10, fill: "#2b729d" }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "#2b729d" }} width={28} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#bfe1f2" }}
              formatter={(value, name, props) => {
                if (name === "actualAvg") {
                  return [value == null ? "No data" : Number(value).toFixed(1), "Actual avg RPE"];
                }
                if (name === "expectedRange") {
                  const p = props.payload as { expectedMin: number; expectedMax: number };
                  return [`${p.expectedMin}-${p.expectedMax}`, "Expected band"];
                }
                return [null, null];
              }}
            />
            <Bar dataKey="expectedMin" stackId="band" fill="transparent" />
            <Bar dataKey="expectedRange" stackId="band" fill="#bfe1f2" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actualAvg" fill="#ff6b3d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-2 text-[11px] text-pool-600">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block bg-[#bfe1f2]" /> Expected band
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block bg-[#ff6b3d]" /> Actual avg
        </span>
      </div>
    </div>
  );
}
