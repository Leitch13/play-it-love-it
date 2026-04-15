import Link from "next/link";
import { UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/AppNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Player Roster – Coaching Platform" };

export default async function PlayersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: players } = await supabase
    .from("players")
    .select(`
      id,
      position,
      level,
      date_of_birth,
      profile:profiles ( full_name, avatar_url )
    `)
    .eq("coach_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav active="dashboard" />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Player Roster</h1>
            <p className="mt-1 text-slate-500">{players?.length ?? 0} players across your programmes.</p>
          </div>
          <Button className="rounded-2xl gap-2">
            <UserPlus className="h-4 w-4" /> Add player
          </Button>
        </div>

        {!players?.length ? (
          <Card className="rounded-3xl">
            <CardContent className="py-12 text-center text-slate-500">
              No players yet. Add your first player to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {players.map((player) => {
              const profile = player.profile as { full_name: string | null } | null;
              return (
                <Card key={player.id} className="rounded-3xl">
                  <CardHeader>
                    <CardTitle>{profile?.full_name ?? "Unnamed player"}</CardTitle>
                    <CardDescription className="capitalize">
                      {player.position ?? "Position TBC"} · {player.level ?? "Level TBC"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {player.level ?? "TBC"}
                    </Badge>
                    <Button variant="ghost" size="sm" className="rounded-xl" asChild>
                      <Link href={`/generator?playerId=${player.id}`}>Build plan</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-6">
          <Button variant="outline" className="rounded-2xl" asChild>
            <Link href="/dashboard">← Back to dashboard</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
