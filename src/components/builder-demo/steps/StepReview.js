import {
  Rocket,
  Edit3,
  Zap,
  Star,
  ArrowRight,
  RotateCcw,
  ChevronLeft,
} from "lucide-react";
import { availableTasks } from "../data/tasks";

export default function StepReview({ formData, setStep, resetForm }) {
  const { template, rewardSystem, selectedTasks = [], config = {} } = formData;
  const taskRewards = config.taskRewards || {};

  const handleLaunch = () => {
    console.log("Final Campaign Data:", formData);
    alert("Campaign Launched!");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20">
      {/* 1. Header with Start Over Option */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="text-left space-y-2">
          <h2 className="text-3xl font-bold">
            Review <span className="text-primary">Campaign</span>
          </h2>
          <p className="text-foreground/60 text-sm">
            Double check everything before going live.
          </p>
        </div>
        <button
          onClick={resetForm}
          className="flex items-center gap-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-2 rounded-lg transition-colors"
        >
          <RotateCcw size={14} /> Start Over
        </button>
      </header>

      {/* 2. High Level Strategy Card */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-surface border-2 border-border rounded-2xl relative group">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
            Template
          </span>
          <p className="font-bold text-lg capitalize">{template || "Custom"}</p>
          <button
            onClick={() => setStep(1)}
            className="absolute top-4 right-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit3 size={16} />
          </button>
        </div>
        <div className="p-6 bg-surface border-2 border-border rounded-2xl relative group">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
            Logic System
          </span>
          <div className="flex items-center gap-2 font-bold text-lg">
            {rewardSystem === "xp" ? (
              <Star size={18} className="text-reward" />
            ) : (
              <Zap size={18} className="text-primary" />
            )}
            <span className="capitalize">
              {rewardSystem?.replace("-", " ")}
            </span>
          </div>
          <button
            onClick={() => setStep(2)}
            className="absolute top-4 right-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit3 size={16} />
          </button>
        </div>
      </div>

      {/* 3. Task & Reward Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground/40">
            Task Breakdown
          </h3>
          <button
            onClick={() => setStep(3)}
            className="text-[10px] font-bold text-primary hover:underline"
          >
            Edit Tasks
          </button>
        </div>

        <div className="bg-surface border-2 border-border rounded-3xl divide-y divide-border overflow-hidden">
          {selectedTasks.map((taskId) => {
            const task = availableTasks.find((t) => t.id === taskId);
            const reward = taskRewards[taskId];

            return (
              <div
                key={taskId}
                className="p-5 flex items-center justify-between group hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-primary">
                    {task?.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{task?.label}</p>
                    <p className="text-[10px] opacity-50 uppercase font-mono">
                      {taskId}
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="opacity-20 group-hover:translate-x-1 transition-transform"
                />
                <div className="text-right">
                  {reward ? (
                    <div className="space-y-0.5">
                      <p className="font-bold text-primary text-sm capitalize">
                        {reward.type === "discount_pct" &&
                          `${reward.value}% Discount`}
                        {reward.type === "discount_val" &&
                          `$${reward.value} Off`}
                        {reward.type === "straight_cash" &&
                          `$${reward.value} Cash`}
                        {reward.type === "free_item" &&
                          `Free ${reward.itemName || "Item"}`}
                      </p>
                      <p className="text-[10px] font-medium opacity-60">
                        {reward.spendType === "custom"
                          ? `Min Spend: $${reward.minSpend}`
                          : "No Min Spend"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-red-500 font-bold">Incomplete</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Navigation Actions */}
      <div className="pt-6 space-y-4">
        <button
          onClick={handleLaunch}
          className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
        >
          <Rocket size={20} /> Launch Campaign
        </button>

        <button
          onClick={() => setStep(4)}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold text-foreground/50 hover:text-foreground transition-colors py-2"
        >
          <ChevronLeft size={16} /> Go back to Rewards
        </button>
      </div>
    </div>
  );
}
