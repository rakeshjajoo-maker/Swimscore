import { redirect } from "next/navigation";
import { createMeet } from "@/app/actions";
import { getCurrentSwimmerId } from "@/lib/currentSwimmer";

export default async function NewMeetPage() {
  const swimmerId = await getCurrentSwimmerId();
  if (!swimmerId) redirect("/swimmers/new");

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-pool-900 mb-1">New Meet</h1>
      <p className="text-pool-700 mb-6 text-sm">
        Add the meet, then add events with goal times on the next screen.
      </p>

      <form
        action={createMeet}
        className="bg-card rounded-xl border border-pool-100 shadow-sm p-5 space-y-4"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-pool-800 mb-1">
            Meet name
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-lg border border-pool-200 px-3 py-2"
            placeholder="Regional Championships"
          />
        </div>

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

        <button
          type="submit"
          className="w-full rounded-lg bg-coral-500 hover:bg-coral-600 text-white font-semibold py-2.5 transition-colors"
        >
          Create meet
        </button>
      </form>
    </div>
  );
}
