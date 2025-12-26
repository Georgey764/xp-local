import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BuilderFooter({ step, nextStep, prevStep }) {
  if (step <= 1 || step >= 5) return null;

  return (
    <div className="mt-12 flex justify-between items-center pt-8 border-t border-border">
      <button onClick={prevStep} className="btn-outline flex gap-2">
        <ChevronLeft size={18} /> Previous
      </button>
      <button onClick={nextStep} className="btn-primary flex gap-2 px-8">
        Continue <ChevronRight size={18} />
      </button>
    </div>
  );
}
