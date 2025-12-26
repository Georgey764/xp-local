import { Zap, Star, CheckCircle2 } from "lucide-react";

export default function StepLogic({ formData = {}, setFormData }) {
  const { rewardSystem = "" } = formData;

  const handleSelection = (system) => {
    setFormData({ ...formData, rewardSystem: system });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <header className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">
          Reward <span className="text-reward">Logic</span>
        </h2>
        <p className="text-foreground/60">
          How do your customers earn their rewards?
        </p>
      </header>

      <div className="grid gap-6">
        {/* Per Task Option */}
        <button
          type="button"
          onClick={() => handleSelection("per-task")}
          className={`
            relative group p-6 rounded-2xl border-2 text-left transition-all duration-300
            ${
              rewardSystem === "per-task"
                ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-lg"
                : "border-border bg-surface hover:border-accent/50"
            }
          `}
        >
          <div className="flex gap-5 items-start">
            <div
              className={`
              p-3 rounded-xl transition-colors
              ${
                rewardSystem === "per-task"
                  ? "bg-primary text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-primary"
              }
            `}
            >
              <Zap
                size={28}
                fill={rewardSystem === "per-task" ? "currentColor" : "none"}
              />
            </div>

            <div className="flex-1">
              <h3
                className={`font-bold text-xl ${
                  rewardSystem === "per-task"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                Instant Gratification
              </h3>
              <p className="text-sm text-foreground/50 mt-1 leading-relaxed">
                Users receive a reward immediately after completing a single
                task. Best for quick engagement.
              </p>
            </div>

            {rewardSystem === "per-task" && (
              <CheckCircle2
                className="text-primary animate-in zoom-in"
                size={24}
              />
            )}
          </div>
        </button>

        {/* XP System Option */}
        <button
          type="button"
          onClick={() => handleSelection("xp")}
          className={`
            relative group p-6 rounded-2xl border-2 text-left transition-all duration-300
            ${
              rewardSystem === "xp"
                ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-lg"
                : "border-border bg-surface hover:border-accent/50"
            }
          `}
        >
          <div className="flex gap-5 items-start">
            <div
              className={`
              p-3 rounded-xl transition-colors
              ${
                rewardSystem === "xp"
                  ? "bg-reward text-neutral-950"
                  : "bg-neutral-100 dark:bg-neutral-800 text-reward"
              }
            `}
            >
              <Star
                size={28}
                fill={rewardSystem === "xp" ? "currentColor" : "none"}
              />
            </div>

            <div className="flex-1">
              <h3
                className={`font-bold text-xl ${
                  rewardSystem === "xp" ? "text-primary" : "text-foreground"
                }`}
              >
                Progression Journey
              </h3>
              <p className="text-sm text-foreground/50 mt-1 leading-relaxed">
                Users accumulate XP points to unlock bigger rewards over time.
                Best for long-term loyalty.
              </p>
            </div>

            {rewardSystem === "xp" && (
              <CheckCircle2
                className="text-primary animate-in zoom-in"
                size={24}
              />
            )}
          </div>
        </button>
      </div>

      {/* Subtle UI Footer */}
      <p className="text-center text-xs text-foreground/30 font-medium uppercase tracking-widest">
        Selection is required to proceed
      </p>
    </div>
  );
}
