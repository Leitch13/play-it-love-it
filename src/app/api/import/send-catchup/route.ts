import { NextResponse } from "next/server";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Send catch-up emails to historical leads that haven't had one sent yet.
 * Targets leads where source='facebook_historical' AND no welcome/catchup email logged.
 * Protected by CRON_SECRET.
 */
export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { cutoffDaysAgo = 40, limit = 100 } = body as {
    cutoffDaysAgo?: number;
    limit?: number;
  };

  const supabase = await createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - cutoffDaysAgo);

  // Find historical leads newer than cutoff that don't have a catchup_sent flag
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, first_name, email, utm_campaign, notes, created_at")
    .eq("source", "facebook_historical")
    .gte("created_at", cutoff.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filter out ones we've already flagged as catchup_sent in notes
  const toSend = (leads ?? []).filter(
    (l) => !(l.notes ?? "").includes("[catchup_sent]")
  ).slice(0, limit);

  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? "Play It Love It";
  const coachName = process.env.COACH_NAME ?? "Coach";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://playitloveit.vercel.app";

  const results = { sent: 0, failed: 0, totalFound: toSend.length, errors: [] as string[] };

  if (!resend) {
    return NextResponse.json({ error: "Resend not configured" }, { status: 500 });
  }

  for (const lead of toSend) {
    const isAcademy = (lead.utm_campaign ?? "") === "academy";
    const bookingPath = isAcademy ? "/book/academy" : "/book/soccer-tots";
    const programmeName = isAcademy ? "Academy & Accelerator" : "Soccer Tots";

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: lead.email,
        subject: `${lead.first_name}, is your player still keen on football coaching?`,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1e293b;">
            <h2 style="margin:0 0 8px;">Hey ${lead.first_name},</h2>
            <p>I wanted to check in — you expressed interest in our <strong>${programmeName}</strong> programme a few weeks back, and I noticed we never got back to you properly. Sorry about that!</p>
            <p>If your player is still keen, we've got spots opening up for free trial sessions over the next couple of weeks.</p>
            <p><strong>What you get with a free trial:</strong></p>
            <ul style="padding-left:20px;line-height:1.8;">
              <li>60-minute coached session with our qualified coaches</li>
              <li>Personalised feedback on your player's development</li>
              <li>No commitment, no strings attached</li>
            </ul>
            <p style="margin:24px 0;">
              <a href="${appUrl}${bookingPath}" style="display:inline-block;padding:14px 28px;background:#059669;color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px;">
                Book Your Free Trial
              </a>
            </p>
            <p>If the timing isn't right anymore, no worries — just ignore this email and I won't chase you again.</p>
            <p>Cheers,<br/>${coachName}<br/>${businessName}</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0 16px;" />
            <p style="font-size:12px;color:#94a3b8;">
              ${businessName} &middot; Professional Football Coaching
            </p>
          </div>
        `,
      });

      // Mark as sent in notes
      await supabase
        .from("leads")
        .update({
          notes: `${lead.notes ?? ""} [catchup_sent:${new Date().toISOString()}]`,
        })
        .eq("id", lead.id);

      results.sent++;
    } catch (err) {
      results.failed++;
      results.errors.push(`${lead.email}: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  return NextResponse.json(results);
}
