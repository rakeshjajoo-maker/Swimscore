import { redirect } from "next/navigation";
import { createSession } from "@/app/actions";
import { getCurrentSwimmerId } from "@/lib/currentSwimmer";
import { SESSION_TYPES } from "@/lib/types";

export default async function NewSessionPage() {
  const swimmerId = await getCurrentSwimmerId();
  if (!swimmerId) {
    redirect("/swimmers/new");
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-pool-900 mb-1">Log a session</h1>
      <p className="text-pool-700 mb-6 text-sm">
        Start the session, then add sets on the next screen.
      </p>

      <form
        action={createSession}
        className="bg-card rounded-xl border border-pool-100 shadow-sm p-5 space-y-4"
      >
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-pool-800 mb-1">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={today}
            className="w-full rounded-lg border border-pool-200 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="sessionType"
            className="block text-sm font-medium text-pool-800 mb-1"
          >
            Session type
          </label>
          <select
            id="sessionType"
            name="sessionType"
            defaultValue="Regular"
            className="w-full rounded-lg border border-pool-200 px-3 py-2 bg-white"
          >
            {SESSION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="preMood" className="block text-sm font-medium text-pool-800 mb-1">
            Pre-session mood <span className="text-pool-400">(optional)</span>
          </label>
          <select
            id="preMood"
            name="preMood"
            defaultValue=""
            className="w-full rounded-lg border border-pool-200 px-3 py-2 bg-white"
          >
            <option value="">Not set</option>
            <option value="1">1 — Drained</option>
            <option value="2">2 — Tired</option>
            <option value="3">3 — Okay</option>
            <option value="4">4 — Good</option>
            <option value="5">5 — Great</option>
          </select>
        </div>

        <div className="pt-1 border-t border-pool-100">
          <label className="flex items-center gap-2 text-sm font-medium text-pool-800">
            <input
              type="checkbox"
              name="attended"
              defaultChecked
              className="h-4 w-4 rounded border-pool-300 accent-pool-600"
            />
            Attended this session
          </label>
        </div>

        <SkipReasonField />

        <button
          type="submit"
          className="w-full rounded-lg bg-coral-500 hover:bg-coral-600 text-white font-semibold py-2.5 transition-colors"
        >
          Start session
        </button>
      </form>
    </div>
  );
}

function SkipReasonField() {
  return (
    <div className="group">
      <label htmlFor="skipReason" className="block text-sm font-medium text-pool-800 mb-1">
        Reason skipped <span className="text-pool-400">(if not attended)</span>
      </label>
      <input
        id="skipReason"
        name="skipReason"
        className="w-full rounded-lg border border-pool-200 px-3 py-2"
        placeholder="Sick, travel, injury..."
      />
    </div>
  );
}
