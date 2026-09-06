"use client";

type NumberStepperProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export function NumberStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
}: NumberStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <div>
      <label className="block text-xs font-medium text-pool-700 mb-1">{label}</label>
      <div className="flex items-center rounded-lg border border-pool-200 bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          className="px-3 py-2 text-pool-600 text-lg font-semibold active:bg-pool-50"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
          className="w-full min-w-0 flex-1 text-center outline-none py-2 text-foreground"
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          className="px-3 py-2 text-pool-600 text-lg font-semibold active:bg-pool-50"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
