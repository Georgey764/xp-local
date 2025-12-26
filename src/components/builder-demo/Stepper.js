import { CheckCircle2 } from "lucide-react";

export default function Stepper({ step, steps }) {
  return (
    <div className="mb-12 relative">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-200 -translate-y-1/2 -z-10" />
      <div className="flex justify-between max-w-2xl mx-auto">
        {steps.map((label, i) => {
          const idx = i + 1;
          return (
            <div key={label} className="flex flex-col items-center gap-2">
              <div
                className={`step-indicator ${
                  step === idx
                    ? "step-active"
                    : step > idx
                    ? "step-complete"
                    : "step-pending"
                }`}
              >
                {step > idx ? <CheckCircle2 size={16} /> : idx}
              </div>
              <span
                className={`text-[10px] font-bold uppercase ${
                  step === idx ? "text-primary" : "opacity-40"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
