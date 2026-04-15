import { NextResponse } from "next/server";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/server";
import { getEmailTemplate, type TemplateKey } from "@/lib/emails";

/**
 * Cron endpoint — sends all due follow-up emails.
 *
 * Call this every 15 minutes via:
 * - Vercel Cron (vercel.json)
 * - Make.com scheduler
 * - Or any external cron service hitting POST /api/cron/follow-ups
 *
 * Protected by CRON_SECRET env var.
 */
export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resend) {
    return NextResponse.json(
      { error: "Email sending not configured" },
      { status: 500 }
    );
  }

  try {
    const supabase = await createServiceClient();
    const now = new Date().toISOString();

    // Fetch all pending emails that are due
    const { data: pendingEmails, error } = await supabase
      .from("email_sequences")
      .select("*, leads(*)")
      .is("sent_at", null)
      .is("cancelled_at", null)
      .lte("scheduled_for", now)
      .order("scheduled_for", { ascending: true })
      .limit(50);

    if (error) {
      console.error("Fetch pending emails error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return NextResponse.json({ sent: 0, message: "No emails due" });
    }

    let sent = 0;
    let failed = 0;

    for (const seq of pendingEmails) {
      const lead = seq.leads as {
        id: string;
        first_name: string;
        email: string;
        child_name: string | null;
        age_group: string | null;
        status: string;
      } | null;

      if (!lead) {
        // Cancel orphan sequence
        await supabase
          .from("email_sequences")
          .update({ cancelled_at: now })
          .eq("id", seq.id);
        continue;
      }

      // Skip if lead has already booked or converted (don't send follow-ups)
      if (["booked", "attended", "converted"].includes(lead.status)) {
        await supabase
          .from("email_sequences")
          .update({ cancelled_at: now })
          .eq("id", seq.id);
        continue;
      }

      try {
        const templateKey = seq.template_key as TemplateKey;
        const { subject, html } = getEmailTemplate(templateKey, {
          firstName: lead.first_name,
          childName: lead.child_name ?? undefined,
          ageGroup: lead.age_group ?? undefined,
        });

        await resend.emails.send({
          from: EMAIL_FROM,
          to: lead.email,
          subject,
          html,
        });

        // Mark as sent
        await supabase
          .from("email_sequences")
          .update({ sent_at: now })
          .eq("id", seq.id);

        sent++;
      } catch (emailErr) {
        console.error(`Failed to send ${seq.template_key} to ${lead.email}:`, emailErr);
        failed++;
      }
    }

    return NextResponse.json({ sent, failed, total: pendingEmails.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("Cron error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Also support GET for Vercel Cron
export async function GET(request: Request) {
  return POST(request);
}
