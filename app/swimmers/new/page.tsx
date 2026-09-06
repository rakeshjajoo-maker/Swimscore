import { createSwimmer } from "@/app/actions";
import { STROKES } from "@/lib/types";

export default function NewSwimmerPage() {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-pool-900 mb-1">Welcome to SwimScore</h1>
      <p className="text-pool-700 mb-6 text-sm">
        Set up a swimmer profile to start logging practices.
      </p>

      <form
        action={createSwimmer}
        className="bg-card rounded-xl border border-pool-100 shadow-sm p-5 space-y-4"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-pool-800 mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-lg border border-pool-200 px-3 py-2"
            placeholder="Jamie Rivera"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-pool-800 mb-1">
              Age
            </label>
            <input
              id="age"
              name="age"
              type="number"
              inputMode="numeric"
              min={5}
              max={99}
              required
              className="w-full rounded-lg border border-pool-200 px-3 py-2"
              placeholder="15"
            />
          </div>
          <div>
            <label htmlFor="squad" className="block text-sm font-medium text-pool-800 mb-1">
              Squad / group
            </label>
            <input
              id="squad"
              name="squad"
              required
              className="w-full rounded-lg border border-pool-200 px-3 py-2"
              placeholder="Senior Elite"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="primaryStroke"
            className="block text-sm font-medium text-pool-800 mb-1"
          >
            Primary stroke
          </label>
          <select
            id="primaryStroke"
            name="primaryStroke"
            required
            defaultValue="Free"
            className="w-full rounded-lg border border-pool-200 px-3 py-2 bg-white"
          >
            {STROKES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="competitionCategory"
            className="block text-sm font-medium text-pool-800 mb-1"
          >
            Competition category
          </label>
          <input
            id="competitionCategory"
            name="competitionCategory"
            required
            className="w-full rounded-lg border border-pool-200 px-3 py-2"
            placeholder="100m Free specialist"
          />
        </div>

        <div>
          <label
            htmlFor="seasonGoal"
            className="block text-sm font-medium text-pool-800 mb-1"
          >
            Season goal <span className="text-pool-400">(optional)</span>
          </label>
          <input
            id="seasonGoal"
            name="seasonGoal"
            className="w-full rounded-lg border border-pool-200 px-3 py-2"
            placeholder="Break 55s in the 100 Free"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-coral-500 hover:bg-coral-600 text-white font-semibold py-2.5 transition-colors"
        >
          Create profile
        </button>
      </form>
    </div>
  );
}
