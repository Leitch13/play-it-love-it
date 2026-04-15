import { CalendarDays, CheckCircle2, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/AppNav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "My Training – Coaching Platform" };

export default async function PlayerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get the player row for the current user
  const { data: playerRow } = await supabase
    .from("players")
    .select("id, position, level")
    .eq("profile_id", user?.id ?? "")
    .single();

  // Get their active training plan + sessions
  const { data: plan } = playerRow
    ? await supabase
        .from("training_plans")
        .select("id, title, weekly_focus, coach_note, week_start")
        .eq("player_id", playerRow.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
    : { data: null };

  const { data: sessions } = plan
    ? await supabase
        .from("sessions")
        .select("id, day_label, focus, drills, recovery_note, completed_at")
        .eq("plan_id", plan.id)
        .order("created_at", { ascending: true })
    : { data: [] };

  // Progress notes visible to the player
  const { data: notes } = playerRow
    ? await supabase
        .from("progress_notes")
        .select("id, body, created_at")
        .eq("player_id", playerRow.id)
        .in("visibility", ["player", "public"])
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: [] };

  const completedCount = (sessions ?? []).filter((s) => s.completed_at).length;
  const totalCount = (sessions ?? []).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav active="player" />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">My Training</h1>
          <p className="mt-1 text-slate-500 capitalize">
            {playerRow?.position ?? "Player"} · {playerRow?.level ?? ""}
          </p>
        </div>

        {!plan ? (
          <Card className="rounded-3xl">
            <CardContent className="py-12 text-center text-slate-500">
              No active training plan yet. Your coach will assign one soon.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Plan overview */}
            <Card className="rounded-3xl lg:col-span-2">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      {plan.title}
                    </CardTitle>
                    <CardDescription className="mt-1">{plan.weekly_focus}</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {completedCount}/{totalCount} done
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.coach_note && (
                  <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
                    <strong>Coach note:</strong> {plan.coach_note}
                  </div>
                )}

                {(sessions ?? []).map((session) => {
                  const drills: string[] = Array.isArray(session.drills)
                    ? (session.drills as string[])
                    : [];
                  return (
                    <div key={session.id} className="rounded-2xl border p-4">
                      <div className="flex items-center gap-3">
                        {session.completed_at ? (
                          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 flex-shrink-0 text-slate-300" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{session.day_label}</h4>
                          <p className="text-sm text-slate-500">{session.focus}</p>
                        </div>
                      </div>
                      {drills.length > 0 && (
                        <ul className="mt-3 ml-8 space-y-1 text-sm text-slate-700">
                          {drills.map((drill) => (
                            <li key={drill}>• {drill}</li>
                          ))}
                        </ul>
                      )}
                      {session.recovery_note && (
                        <p className="mt-2 ml-8 text-sm text-slate-400">
                          Recovery: {session.recovery_note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Progress notes from coach */}
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Coach feedback</CardTitle>
                <CardDescription>Notes shared with you by your coach.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(notes ?? []).length === 0 ? (
                  <p className="text-sm text-slate-400">No feedback yet.</p>
                ) : (
                  (notes ?? []).map((note) => (
                    <div key={note.id} className="rounded-2xl border p-3 text-sm text-slate-700">
                      <p>{note.body}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
