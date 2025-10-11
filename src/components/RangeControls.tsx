const PRESETS = [
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
];

interface RangeControlsProps {
  currentDays: number;
  onChange: (days: number) => void;
}

export function RangeControls({ currentDays, onChange }: RangeControlsProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card p-1 text-sm shadow-sm">
      {PRESETS.map((preset) => {
        const active = preset.days === currentDays;
        return (
          <button
            key={preset.days}
            type="button"
            className={[
              "rounded-full px-3 py-1 transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            ].join(" ")}
            onClick={() => onChange(preset.days)}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
