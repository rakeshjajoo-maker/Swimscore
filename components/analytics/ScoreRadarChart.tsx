"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Point {
  subject: string;
  score: number;
}

export function ScoreRadarChart({ data }: { data: Point[] }) {
  return (
    <div className="bg-card rounded-xl border border-pool-100 p-4 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="#bfe1f2" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#2b729d" }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "#8fcbe8" }} />
          <Tooltip
            formatter={(value) => [Math.round(Number(value)), "Score"]}
            contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#bfe1f2" }}
          />
          <Radar dataKey="score" stroke="#ff6b3d" fill="#ff6b3d" fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
