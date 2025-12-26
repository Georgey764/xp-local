import { availableTasks } from "../data/tasks";
import { Check } from "lucide-react";

export default function StepTasks({ formData, setFormData }) {
  // We extract selectedTasks with a fallback to an empty array
  const selectedTasks = formData?.selectedTasks || [];

  const toggleTask = (taskId) => {
    const isSelected = selectedTasks.includes(taskId);

    setFormData((prev) => ({
      ...prev,
      selectedTasks: isSelected
        ? prev.selectedTasks.filter((id) => id !== taskId) // Remove if exists
        : [...prev.selectedTasks, taskId], // Add if new
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Task Configuration</h2>
        <p className="opacity-70">
          Which actions should your visitors complete?
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {availableTasks.map((task) => {
          const isSelected = selectedTasks.includes(task.id);

          return (
            <button
              key={task.id}
              type="button" // Important to prevent form submission
              onClick={() => toggleTask(task.id)}
              className={`relative p-4 rounded-xl border-2 text-left flex gap-3 transition-all duration-200
                ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                    : "border-border bg-surface hover:border-accent/40 grayscale hover:grayscale-0"
                }
              `}
            >
              <div
                className={`p-2 rounded-lg ${
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-neutral-100 dark:bg-neutral-800"
                }`}
              >
                {task.icon}
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-sm">{task.label}</span>
                <span className="text-[10px] opacity-40 uppercase font-black">
                  {isSelected ? "Selected" : "Click to add"}
                </span>
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5 text-white">
                  <Check size={12} strokeWidth={4} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
