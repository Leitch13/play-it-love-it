import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/AppNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PricingLine } from "@/components/PricingLine";
import { SubscribeButton } from "@/components/SubscribeButton";
import { HubSearch } from "@/components/HubSearch";

export const metadata = {
  title: "Training Hub – Coaching Platform",
};

// Fallback sessions shown when Supabase isn't configured yet
const fallbackSessions = [
  { id: "1", title: "Ball Mastery Foundations", type: "At Home", duration_minutes: 22, tag: "Technique", is_published: true },
  { id: "2", title: "First Touch Under Pressure", type: "Solo + Wall", duration_minutes: 28, tag: "Control", is_published: true },
  { id: "3", title: "Finishing Reps For Forwards", type: "Pitch", duration_minutes: 35, tag: "Finishing", is_published: true },
  { id: "4", title: "Speed And Change Of Direction", type: "Athletic", duration_minutes: 24, tag: "Speed", is_published: true },
];

export default async function HubPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string }>;
}) {
  const { tag, q } = await searchParams;
  const supabase = await createClient();

  let dbSessions = null;
  if (supabase) {
    let query = supabase
      .from("session_templates")
      .select("id, title, type, duration_minutes, tag, is_published")
      .eq("is_published", true);

    if (tag) query = query.eq("tag", tag);
    if (q) query = query.ilike("title", `%${q}%`);

    ({ data: dbSessions } = await query.order("created_at", { ascending: false }));
  }

  // Use DB sessions if available, else show fallback UI
  const sessions = dbSessions?.length ? dbSessions : fallbackSessions;

  // Unique tags for filter chips
  const allTags = Array.from(new Set(sessions.map((s) => s.tag).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav active="hub" />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Training Hub</h1>
          <p className="mt-1 text-slate-500">
            A gated session library for your members. Add auth + Stripe to unlock the full revenue path.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Session library */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search + tag filters */}
            <HubSearch currentTag={tag} currentQ={q} tags={allTags} />

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Session library</CardTitle>
                <CardDescription>
                  {sessions.length} session{sessions.length !== 1 ? "s" : ""} available
                  {tag ? ` · filtered by "${tag}"` : ""}
                  {q ? ` · search: "${q}"` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {sessions.map((session) => (
                  <Card key={session.id} className="rounded-2xl border shadow-none">
                    <CardHeader>
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <CardDescription>
                        {session.type} · {session.duration_minutes} min
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {session.tag && <Badge variant="outline">{session.tag}</Badge>}
                      <Button
                        variant="ghost"
                        className="mt-4 w-full justify-between rounded-2xl"
                        asChild
                      >
                        <Link href={`/hub/${session.id}`}>
                          Open session <PlayCircle className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Membership path */}
          <Card className="rounded-3xl self-start">
            <CardHeader>
              <CardTitle>Membership path</CardTitle>
              <CardDescription>How this becomes revenue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <PricingLine name="Free" value="Lead magnet + 1 sample session" />
              <PricingLine name="Low-ticket" value="Monthly hub membership" />
              <PricingLine name="High-ticket" value="Custom plan + feedback + check-ins" />
              <SubscribeButton />
              <div className="rounded-2xl bg-slate-100 p-4 text-xs text-slate-500">
                Stripe checkout opens when STRIPE_PRICE_HUB_MONTHLY is configured.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
