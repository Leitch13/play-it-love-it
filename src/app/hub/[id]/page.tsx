import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, PlayCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/AppNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("session_templates")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (!session) notFound();

  const content = session.content as {
    description?: string;
    drills?: string[];
    video_url?: string;
    pdf_url?: string;
  } | null;

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav active="hub" />

      <main className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
        <Button variant="ghost" className="mb-6 gap-2 rounded-2xl" asChild>
          <Link href="/hub">
            <ArrowLeft className="h-4 w-4" /> Back to hub
          </Link>
        </Button>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{session.title}</h1>
            <p className="mt-1 text-slate-500">
              {session.type} · {session.duration_minutes} min
            </p>
          </div>
          <div className="flex gap-2">
            {session.tag && <Badge variant="outline">{session.tag}</Badge>}
            {session.type && <Badge variant="secondary">{session.type}</Badge>}
          </div>
        </div>

        {content?.video_url && (
          <div className="mb-6 aspect-video w-full overflow-hidden rounded-3xl bg-slate-900">
            <iframe
              src={content.video_url}
              className="h-full w-full"
              allowFullScreen
              title={session.title}
            />
          </div>
        )}

        {!content?.video_url && (
          <div className="mb-6 flex aspect-video items-center justify-center rounded-3xl bg-slate-200">
            <PlayCircle className="h-16 w-16 text-slate-400" />
          </div>
        )}

        {content?.description && (
          <Card className="mb-4 rounded-3xl">
            <CardContent className="pt-6 text-slate-700">{content.description}</CardContent>
          </Card>
        )}

        {content?.drills && content.drills.length > 0 && (
          <Card className="mb-4 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Session drills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {content.drills.map((drill, i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl border p-3 text-sm">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs text-white">
                    {i + 1}
                  </span>
                  <span className="text-slate-700">{drill}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {content?.pdf_url && (
          <Button className="w-full rounded-2xl" asChild>
            <a href={content.pdf_url} target="_blank" rel="noopener noreferrer">
              Download session PDF
            </a>
          </Button>
        )}
      </main>
    </div>
  );
}
