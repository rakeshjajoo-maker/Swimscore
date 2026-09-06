import { redirect } from "next/navigation";
import { getCurrentSwimmerId } from "@/lib/currentSwimmer";
import { getWeeklyVolume, getDailyVolume, getWeeklyAttendance } from "@/lib/analytics";
import { VolumeBarChart } from "@/components/analytics/VolumeBarChart";
import { CalendarHeatmap } from "@/components/analytics/CalendarHeatmap";
import { AttendanceLineChart } from "@/components/analytics/AttendanceLineChart";

export default async function VolumeConsistencyPage() {
  const swimmerId = await getCurrentSwimmerId();
  if (!swimmerId) redirect("/swimmers/new");

  const [weeklyVolume, dailyVolume, attendance] = await Promise.all([
    getWeeklyVolume(swimmerId, 12),
    getDailyVolume(swimmerId, 84),
    getWeeklyAttendance(swimmerId, 12),
  ]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-pool-800 mb-2">Meters per week</h2>
        <VolumeBarChart
          data={weeklyVolume.map((p) => ({
            weekStart: p.weekStart.toISOString(),
            totalMeters: p.totalMeters,
          }))}
        />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-pool-800 mb-2">Daily training volume</h2>
        <CalendarHeatmap
          data={dailyVolume.map((p) => ({
            date: p.date.toISOString(),
            totalMeters: p.totalMeters,
          }))}
        />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-pool-800 mb-2">Attendance rate</h2>
        <AttendanceLineChart
          data={attendance.map((p) => ({
            weekStart: p.weekStart.toISOString(),
            attendanceRate: p.attendanceRate,
          }))}
        />
      </section>
    </div>
  );
}
