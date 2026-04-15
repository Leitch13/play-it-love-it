import Link from "next/link";
import { CalendarDays, ClipboardList, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/AppNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Parent Portal – Coaching Platform" };

export default async function ParentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch linked players via parent_player_links
  const { data: links } = await supabase
    .from("parent_player_links")
    .select(`
      id,
      relationship,
      player:players (
        id,
        position,
        level,
        profile:profiles ( full_name )
      )
    `)
    .eq("parent_id",
      (
        await supabase
          .from("parents")
          .select("id")
          .eq("profile_id", user?.id ?? "")
          .single()
      ).data?.id ?? ""
    );

  const players = links ?? [];

  // Fetch recent progress notes for linked player IDs
  const playerIds = players.map((l) => (l.player as { id: string })?.id).filter(Boolean);

  const { data: notes } = playerIds.length
    ? await supabase
        .from("progress_notes")
        .select("id, body, created_at, player_id, visibility")
        .in("player_id", playerIds)
        .in("visibility", ["coach_parent", "player", "public"])
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav active="parent" />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Parent Portal</h1>
          <p className="mt-1 text-slate-500">
            Track your child's training, view progress notes, and stay in contact with their coach.
          </p>
        </div>

        {players.length === 0 ? (
          <Card className="rounded-3xl">
            <CardContent className="py-12 text-center text-slate-500">
              No players linked to your account yet. Ask your coach to link your child's profile.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {players.map((link) => {
              const player = link.player as {
                id: string;
                position: string | null;
                level: string | null;
                profile: { full_name: string | null } | null;
              };
              const playerNotes = (notes ?? []).filter((n) => n.player_id === player.id);

              return (
                <Card key={link.id} className="rounded-3xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{player.profile?.full_name ?? "Player"}</CardTitle>
                      <Badge variant="secondary" className="capitalize">
                        {link.relationship ?? "Guardian"}
                      </Badge>
                    </div>
                    <CardDescription className="capitalize">
                      {player.position ?? "—"} · {player.level ?? "—"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Active plan link */}
                    <Button variant="outline" className="w-full justify-start rounded-2xl gap-2" asChild>
                      <Link href={`/parent/player/${player.id}/plan`}>
                        <CalendarDays className="h-4 w-4" /> View active training plan
                      </Link>
                    </Button>

                    {/* Recent progress notes */}
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <ClipboardList className="h-4 w-4" /> Recent progress notes
                      </h4>
                      {playerNotes.length === 0 ? (
                        <p className="text-sm text-slate-400">No notes shared yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          {playerNotes.slice(0, 3).map((note) => (
                            <li key={note.id} className="rounded-xl border p-3 text-sm text-slate-700">
                              {note.body}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Message coach */}
                    <Button variant="ghost" className="w-full justify-start rounded-2xl gap-2" asChild>
                      <Link href="/messages">
                        <MessageSquare className="h-4 w-4" /> Message coach
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
