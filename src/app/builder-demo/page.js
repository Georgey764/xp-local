"use client";

import { useState } from "react";

// Layout Components
import BuilderHeader from "@/components/builder-demo/BuilderHeader";
import Stepper from "@/components/builder-demo/Stepper";
import BuilderFooter from "@/components/builder-demo/BuilderFooter";

// Step Components
import StepTemplate from "@/components/builder-demo/steps/StepTemplate";
import StepLogic from "@/components/builder-demo/steps/StepLogic";
import StepTasks from "@/components/builder-demo/steps/StepTasks";
import StepRewards from "@/components/builder-demo/steps/StepRewards";
import StepReview from "@/components/builder-demo/steps/StepReview";

// Initial State constant for starting over
const INITIAL_STATE = {
  template: "",
  rewardSystem: "per-task", // Default to per-task
  selectedTasks: [],
  rewardTypes: [],
  config: {
    taskRewards: {}, // Key: TaskID, Value: Reward Config Object
    xpType: "same",
    globalXP: 10,
    rewardStructure: "single",
  },
};

export default function BuilderPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_STATE);

  const steps = ["Template", "Logic", "Tasks", "Rewards", "Review"];

  // --- Handlers ---

  // Inside BuilderPage.js

  const nextStep = () => {
    // Step 2 Validation: Logic Selection
    if (step === 2 && !formData.rewardSystem) {
      alert("Please select a reward logic to continue.");
      return;
    }

    // Step 3 Validation: Task Selection
    if (step === 3 && formData.selectedTasks.length === 0) {
      alert("Please select at least one task.");
      return;
    }

    // Step 4 Validation: Reward Requirements
    if (step === 4) {
      const { selectedTasks, config } = formData;
      const taskRewards = config.taskRewards || {};

      // Check if EVERY selected task has a reward type assigned
      const allTasksHaveRewards = selectedTasks.every(
        (taskId) => taskRewards[taskId] && taskRewards[taskId].type
      );

      if (!allTasksHaveRewards) {
        alert(
          "Please assign a reward type to every selected task before continuing."
        );
        return;
      }
    }

    setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const resetForm = () => {
    if (
      window.confirm(
        "Are you sure you want to start over? All progress will be lost."
      )
    ) {
      setFormData(INITIAL_STATE);
      setStep(1);
    }
  };

  const updateTemplate = (id) => {
    setFormData((prev) => ({ ...prev, template: id }));
    setStep(2); // Auto-advance from template selection
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <BuilderHeader />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Navigation */}
        <Stepper step={step} steps={steps} />

        {/* Dynamic Step Rendering */}
        <div className="mt-10 min-h-[400px]">
          {step === 1 && (
            <StepTemplate formData={formData} onSelect={updateTemplate} />
          )}

          {step === 2 && (
            <StepLogic formData={formData} setFormData={setFormData} />
          )}

          {step === 3 && (
            <StepTasks formData={formData} setFormData={setFormData} />
          )}

          {step === 4 && (
            <StepRewards formData={formData} setFormData={setFormData} />
          )}

          {step === 5 && (
            <StepReview
              formData={formData}
              setStep={setStep}
              resetForm={resetForm}
            />
          )}
        </div>

        {/* Navigation Buttons (Hidden on Template and Review) */}
        <BuilderFooter step={step} nextStep={nextStep} prevStep={prevStep} />
      </main>
    </div>
  );
}
