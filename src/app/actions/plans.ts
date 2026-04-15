"use server";

import { createClient } from "@/lib/supabase/server";
import type { TrainingPlan, PlanInput } from "@/lib/planGenerator";

export type SavePlanState = {
  error: string | null;
  planId: string | null;
};

export async function savePlan(
  plan: TrainingPlan,
  input: PlanInput
): Promise<SavePlanState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Database not configured", planId: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in to save a plan.", planId: null };

  // Look up the player row for the current user (coaches save on behalf of players).
  // For now: if the current user IS a player, use their own player row.
  const { data: playerRow } = await supabase
    .from("players")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!playerRow) {
    return {
      error:
        "No player profile found. Ask your coach to set up your player profile first.",
      planId: null,
    };
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday

  const { data: savedPlan, error: planError } = await supabase
    .from("training_plans")
    .insert({
      player_id: playerRow.id,
      coach_id: user.id,
      title: plan.title,
      weekly_focus: plan.weeklyFocus,
      coach_note: plan.coachNote,
      week_start: weekStart.toISOString().split("T")[0],
    })
    .select("id")
    .single();

  if (planError || !savedPlan) {
    return { error: planError?.message ?? "Failed to save plan.", planId: null };
  }

  // Insert session rows
  const sessionRows = plan.sessions.map((s) => ({
    plan_id: savedPlan.id,
    player_id: playerRow.id,
    day_label: s.day,
    focus: s.focus,
    drills: s.drills,
    recovery_note: s.recovery,
  }));

  const { error: sessionError } = await supabase
    .from("sessions")
    .insert(sessionRows);

  if (sessionError) {
    return { error: sessionError.message, planId: savedPlan.id };
  }

  return { error: null, planId: savedPlan.id };
}
