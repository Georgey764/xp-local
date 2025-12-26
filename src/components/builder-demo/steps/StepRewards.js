"use client";

import {
  Percent,
  DollarSign,
  Gift,
  Coins,
  Image as ImageIcon,
  Star,
  Sparkles,
  Plus,
  Trash2,
  Info,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { availableTasks } from "../data/tasks";

export default function StepRewards({ formData, setFormData }) {
  const { selectedTasks = [], rewardSystem, config = {} } = formData;

  // Data extraction with safe fallbacks
  const taskRewards = config.taskRewards || {};
  const taskXP = config.taskXP || {};
  // FIX: Fallback to an empty array to keep the render pure
  const rewardCatalog = config.rewardCatalog || [];

  // --- State Helpers ---
  const updateConfig = (updates) => {
    setFormData((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  };

  const updateTaskReward = (taskId, updates) => {
    updateConfig({
      taskRewards: {
        ...taskRewards,
        [taskId]: { ...taskRewards[taskId], ...updates },
      },
    });
  };

  const updateCatalogItem = (id, updates) => {
    const updated = rewardCatalog.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    updateConfig({ rewardCatalog: updated });
  };

  // --- Suggestion Algorithms ---
  const setSuggestedXP = () => {
    const suggestions = {};
    selectedTasks.forEach((id) => {
      if (id.includes("review") || id.includes("referral"))
        suggestions[id] = 100;
      else if (id.includes("story") || id.includes("post"))
        suggestions[id] = 50;
      else suggestions[id] = 25;
    });
    updateConfig({ taskXP: suggestions });
  };

  const setSuggestedShop = () => {
    const updated = rewardCatalog.map((r, i) => ({
      ...r,
      xpCost: (i + 1) * 250,
      type: r.type || (i === 0 ? "discount_pct" : "free_item"),
      value: r.value || (i + 1) * 5,
      itemName: r.type === "free_item" ? "Suggested Item" : "",
      spendType: "any",
    }));
    updateConfig({ rewardCatalog: updated });
  };

  if (selectedTasks.length === 0) {
    return (
      <div className="text-center p-20 border-2 border-dashed border-border rounded-3xl opacity-50">
        <p className="font-bold text-lg">No tasks selected.</p>
        <p className="text-sm">
          Go back to Step 3 to select actions for your customers.
        </p>
      </div>
    );
  }

  // ==========================================
  // VIEW: INSTANT GRATIFICATION (Per Task)
  // ==========================================
  if (rewardSystem === "per-task") {
    return (
      <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in">
        <header className="text-center space-y-2">
          <h2 className="text-3xl font-bold italic">
            Instant <span className="text-primary">Payouts</span>
          </h2>
          <p className="text-foreground/60 text-sm">
            Assign a specific reward for every customer action.
          </p>
        </header>

        {selectedTasks.map((taskId) => {
          const task = availableTasks.find((t) => t.id === taskId);
          const reward = taskRewards[taskId] || {};
          const isMissing = !reward?.type;

          return (
            <div
              key={taskId}
              className={`bg-surface border-2 rounded-3xl overflow-hidden shadow-sm transition-all ${
                isMissing ? "border-red-500/30 bg-red-50/5" : "border-border"
              }`}
            >
              <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                    {task?.icon}
                  </div>
                  <h3 className="font-bold text-lg">{task?.label}</h3>
                </div>
                {isMissing && (
                  <span className="text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-900/20 px-3 py-1 rounded-full animate-pulse uppercase tracking-wider">
                    Required
                  </span>
                )}
              </div>
              <div className="p-8">
                <RewardConfigurator
                  data={reward}
                  onChange={(updates) => updateTaskReward(taskId, updates)}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ==========================================
  // VIEW: CURRENCY SYSTEM (XP Shop)
  // ==========================================
  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-20 animate-in fade-in">
      {/* 1. THE EARN ECONOMY */}
      <section className="space-y-8">
        <header className="flex justify-between items-end border-b border-border pb-4">
          <div>
            <h2 className="text-2xl font-bold flex gap-2 items-center">
              <TrendingUp className="text-reward" /> Point Payouts
            </h2>
            <p className="text-sm opacity-50 italic">
              Set how much currency customers earn per action.
            </p>
          </div>
          <button
            onClick={setSuggestedXP}
            className="text-xs font-bold bg-reward/10 text-reward px-4 py-2 rounded-full flex gap-2 items-center hover:bg-reward/20 transition-all"
          >
            <Sparkles size={14} /> Auto-Set Suggestions
          </button>
        </header>

        <div className="grid md:grid-cols-2 gap-4">
          {selectedTasks.map((id) => (
            <div
              key={id}
              className="p-6 bg-surface border-2 border-border rounded-2xl flex justify-between items-center shadow-sm"
            >
              <span className="font-bold text-sm">
                {availableTasks.find((t) => t.id === id)?.label}
              </span>
              <div className="flex items-center gap-2">
                {[25, 50, 100].map((v) => (
                  <button
                    key={v}
                    onClick={() =>
                      updateConfig({ taskXP: { ...taskXP, [id]: v } })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                      taskXP[id] == v
                        ? "border-reward bg-reward text-neutral-900"
                        : "border-border hover:border-accent"
                    }`}
                  >
                    {v}
                  </button>
                ))}
                <input
                  type="number"
                  placeholder="Custom"
                  value={taskXP[id] ?? ""}
                  className="w-16 p-1.5 text-xs text-center border-2 border-border rounded-lg outline-none font-bold focus:border-reward transition-colors"
                  onChange={(e) =>
                    updateConfig({
                      taskXP: { ...taskXP, [id]: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. THE SHOP CATALOG */}
      <section className="space-y-8">
        <header className="flex justify-between items-end border-b border-border pb-4">
          <div>
            <h2 className="text-2xl font-bold flex gap-2 items-center">
              <ShoppingBag className="text-primary" /> Reward Catalog
            </h2>
            <p className="text-sm opacity-50 italic">
              Items customers purchase using their banked XP.
            </p>
          </div>
          <button
            onClick={setSuggestedShop}
            className="text-xs font-bold bg-primary/10 text-primary px-4 py-2 rounded-full flex gap-2 items-center hover:bg-primary/20 transition-all"
          >
            <Sparkles size={14} /> Auto-Fill Shop
          </button>
        </header>

        <div className="space-y-6">
          {rewardCatalog.map((r, i) => (
            <div
              key={r.id}
              className="p-8 bg-surface border-2 border-border rounded-3xl space-y-8 relative group shadow-sm transition-all hover:border-primary/20"
            >
              <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/50 -m-8 mb-0 p-6 border-b border-border">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary px-3 py-1 bg-primary/10 rounded-full">
                  Catalog Item {i + 1}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold opacity-40 italic">
                    Redemption Cost:
                  </span>
                  <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 p-1 rounded-xl border border-border">
                    {[250, 500, 1000].map((val) => (
                      <button
                        key={val}
                        onClick={() => updateCatalogItem(r.id, { xpCost: val })}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                          r.xpCost == val
                            ? "bg-primary text-white shadow-sm"
                            : "opacity-40"
                        }`}
                      >
                        {val} XP
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    placeholder="Custom"
                    value={r.xpCost ?? ""}
                    className="w-16 p-2 text-xs text-center border-2 border-border rounded-xl font-bold outline-none focus:border-primary"
                    onChange={(e) =>
                      updateCatalogItem(r.id, { xpCost: e.target.value })
                    }
                  />
                </div>
              </div>

              <RewardConfigurator
                data={r}
                onChange={(updates) => updateCatalogItem(r.id, updates)}
              />

              {rewardCatalog.length > 1 && (
                <button
                  onClick={() =>
                    updateConfig({
                      rewardCatalog: rewardCatalog.filter(
                        (item) => item.id !== r.id
                      ),
                    })
                  }
                  className="absolute top-4 right-4 text-red-500 hover:scale-110 transition-transform"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={() =>
              updateConfig({
                rewardCatalog: [
                  ...rewardCatalog,
                  // ID generation happens here (Event Handler) - Render stays pure
                  {
                    id: Date.now(),
                    type: "",
                    xpCost: "",
                    spendType: "any",
                    value: "",
                    itemName: "",
                  },
                ],
              })
            }
            className="w-full py-6 border-2 border-dashed border-border rounded-3xl flex items-center justify-center gap-2 text-foreground/40 hover:border-primary hover:text-primary transition-all font-bold text-sm"
          >
            <Plus size={18} /> Add Item to Catalog
          </button>
        </div>
      </section>
    </div>
  );
}

// --- SHARED CONFIGURATOR ---
function RewardConfigurator({ data, onChange }) {
  return (
    <div className="space-y-8">
      {/* 1. Type Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: "discount_pct", label: "Discount %", icon: Percent },
          { id: "discount_val", label: "$ Off", icon: DollarSign },
          { id: "straight_cash", label: "Straight $", icon: Coins },
          { id: "free_item", label: "Free Item", icon: Gift },
        ].map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange({ type: type.id })}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
              data?.type === type.id
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                : "border-border opacity-50 hover:opacity-100"
            }`}
          >
            <type.icon
              size={18}
              className={data?.type === type.id ? "text-primary" : ""}
            />
            <span
              className={`text-[10px] font-bold uppercase ${
                data?.type === type.id ? "text-primary" : ""
              }`}
            >
              {type.label}
            </span>
          </button>
        ))}
      </div>

      {/* 2. Detail Inputs with Controlled Fallbacks */}
      {data?.type ? (
        <div className="animate-in zoom-in-95 duration-300 pt-6 border-t border-border">
          {(data.type === "discount_pct" || data.type === "discount_val") && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold mr-2">Amount:</span>
                {[5, 10, 15, 20].map((v) => (
                  <button
                    key={v}
                    onClick={() => onChange({ value: v })}
                    className={`px-5 py-2 rounded-xl border-2 text-sm font-bold transition-colors ${
                      data.value == v
                        ? "bg-primary text-white border-primary"
                        : "border-border hover:border-accent"
                    }`}
                  >
                    {data.type === "discount_pct" ? `${v}%` : `$${v}`}
                  </button>
                ))}
                <input
                  type="number"
                  placeholder="Custom"
                  value={data.value ?? ""}
                  className="w-20 p-2 bg-neutral-100 dark:bg-neutral-900 rounded-xl text-center text-sm font-bold border-2 border-transparent focus:border-primary outline-none"
                  onChange={(e) => onChange({ value: e.target.value })}
                />
              </div>
              <div className="p-4 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-2xl flex justify-between items-center gap-4 border border-border">
                <span className="text-xs font-bold italic opacity-60 flex items-center gap-2">
                  <Info size={14} /> Purchase Requirement:
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex bg-white dark:bg-neutral-900 p-1 rounded-lg border border-border shadow-sm">
                    <button
                      onClick={() => onChange({ spendType: "any" })}
                      className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                        data.spendType !== "custom"
                          ? "bg-primary text-white"
                          : "opacity-40"
                      }`}
                    >
                      Any Spend
                    </button>
                    <button
                      onClick={() => onChange({ spendType: "custom" })}
                      className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                        data.spendType === "custom"
                          ? "bg-primary text-white"
                          : "opacity-40"
                      }`}
                    >
                      Min $ Spend
                    </button>
                  </div>
                  {data.spendType === "custom" && (
                    <input
                      type="number"
                      value={data.minSpend ?? ""}
                      className="w-16 p-1 text-xs font-bold border border-border rounded-md outline-none focus:border-primary"
                      placeholder="50"
                      onChange={(e) => onChange({ minSpend: e.target.value })}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          {data.type === "straight_cash" && (
            <div className="flex items-center gap-4 p-5 bg-neutral-50 dark:bg-neutral-900/30 rounded-2xl border border-border">
              <span className="text-sm font-bold">Payout Amount:</span>
              <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 px-4 py-2 rounded-xl border-2 border-border focus-within:border-primary transition-colors">
                <span className="font-bold text-primary">$</span>
                <input
                  type="number"
                  className="outline-none bg-transparent font-bold w-20"
                  placeholder="5.00"
                  value={data.value ?? ""}
                  onChange={(e) => onChange({ value: e.target.value })}
                />
              </div>
            </div>
          )}
          {data.type === "free_item" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                  Item Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Free Latte"
                  value={data.itemName ?? ""}
                  className="w-full p-4 bg-neutral-100 dark:bg-neutral-900 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-primary"
                  onChange={(e) => onChange({ itemName: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                  Item Photo
                </label>
                <div className="border-2 border-dashed border-border rounded-2xl flex items-center justify-center p-3 h-[60px] cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-xs font-bold opacity-30 hover:opacity-100">
                  <ImageIcon className="mr-2" size={16} /> Upload JPG/PNG
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-10 text-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-2xl">
          <p className="text-sm text-foreground/30 italic">
            Select a reward type above to configure the payout
          </p>
        </div>
      )}
    </div>
  );
}
