"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { savePlan } from "@/app/actions/plans";
import type { TrainingPlan, PlanInput } from "@/lib/planGenerator";

type Props = {
  plan: TrainingPlan;
  input: PlanInput;
};

export function SavePlanButton({ plan, input }: Props) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error: string | null; planId: string | null } | null>(null);

  const handleSave = () => {
    startTransition(async () => {
      const res = await savePlan(plan, input);
      setResult(res);
    });
  };

  if (result?.planId) {
    return (
      <div className="rounded-2xl bg-green-50 px-4 py-3 text-center text-sm text-green-700">
        Plan saved successfully!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {result?.error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          {result.error}
        </div>
      )}
      <Button
        className="w-full rounded-2xl"
        onClick={handleSave}
        disabled={isPending}
      >
        {isPending ? "Saving…" : "Save plan"}
      </Button>
    </div>
  );
}
