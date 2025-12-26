import { Coffee, Settings, CheckCircle2 } from "lucide-react";

const OPTIONS = [
  {
    id: "cafe",
    title: "Small Cafe Shop",
    description:
      "Pre-configured settings for quick service and beverage menus.",
    icon: Coffee,
  },
  {
    id: "custom",
    title: "Custom Setup",
    description: "Build your workspace from scratch with bespoke parameters.",
    icon: Settings,
  },
];

export default function StepTemplate({ formData, onSelect }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const isSelected = formData?.type === option.id;

        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            aria-pressed={isSelected}
            className={`
              relative flex flex-col items-center text-center p-8 rounded-2xl border-2 transition-all duration-300 group
              ${
                isSelected
                  ? "border-primary bg-primary/5 ring-3 ring-primary/20"
                  : "border-border bg-surface hover:border-accent hover:shadow-xl hover:shadow-accent/10"
              }
            `}
          >
            {/* Selected Indicator - Using your Reward color */}
            {isSelected && (
              <div className="absolute top-4 right-4 text-reward animate-in fade-in zoom-in duration-300">
                <CheckCircle2
                  size={24}
                  fill="currentColor"
                  className="text-reward/20"
                />
              </div>
            )}

            {/* Icon Container - Using Primary and Accent colors */}
            <div
              className={`
              p-4 rounded-xl transition-transform duration-300 group-hover:scale-110
              ${
                isSelected
                  ? "bg-primary text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-foreground/70"
              }
            `}
            >
              <Icon size={32} strokeWidth={isSelected ? 2.5 : 2} />
            </div>

            <h3
              className={`font-bold mt-6 text-xl tracking-tight ${
                isSelected ? "text-primary" : "text-foreground"
              }`}
            >
              {option.title}
            </h3>

            <p className="mt-2 text-sm text-foreground/60 leading-relaxed max-w-[200px]">
              {option.description}
            </p>

            {/* Subtle "Active" footer bar */}
            <div
              className={`
              absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-0 transition-all duration-300 rounded-t-full
              ${isSelected ? "w-1/2 bg-primary" : "group-hover:w-1/4 bg-accent"}
            `}
            />
          </button>
        );
      })}
    </div>
  );
}
