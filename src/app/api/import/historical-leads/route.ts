import { NextResponse } from "next/server";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * One-off import endpoint for historical Facebook leads.
 *
 * Protected by CRON_SECRET. Accepts a JSON array of leads.
 * Imports all to Supabase. Sends catch-up emails to those
 * created after `catchupCutoff` ISO date.
 */

interface HistoricalLead {
  firstName: string;
  email: string;
  createdAt: string; // ISO
  form: string;
}

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await request.json();
  const { leads, catchupCutoff } = body as {
    leads: HistoricalLead[];
    catchupCutoff: string; // ISO date — leads created after this get an email
  };

  const supabase = await createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const cutoff = new Date(catchupCutoff);

  const results = {
    imported: 0,
    skipped: 0,
    emailed: 0,
    errors: [] as string[],
  };

  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? "Play It Love It";
  const coachName = process.env.COACH_NAME ?? "Coach";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://playitloveit.vercel.app";

  for (const lead of leads) {
    try {
      const isAcademy = lead.form.toLowerCase().includes("feb 12");
      const bookingPath = isAcademy ? "/book/academy" : "/book/soccer-tots";
      const programmeName = isAcademy ? "Academy & Accelerator" : "Soccer Tots";

      // Check if lead already exists
      const { data: existing } = await supabase
        .from("leads")
        .select("id")
        .eq("email", lead.email.toLowerCase().trim())
        .limit(1)
        .maybeSingle();

      if (existing) {
        results.skipped++;
        continue;
      }

      // Insert lead
      const { data: newLead, error: insertErr } = await supabase
        .from("leads")
        .insert({
          first_name: lead.firstName,
          email: lead.email.toLowerCase().trim(),
          source: "facebook_historical",
          utm_campaign: isAcademy ? "academy" : "soccer-tots",
          utm_source: "facebook",
          status: "contacted",
          notes: `Imported from Facebook Leads Center. Form: ${lead.form}. Original lead date: ${lead.createdAt}`,
          created_at: lead.createdAt,
        })
        .select()
        .single();

      if (insertErr) {
        results.errors.push(`${lead.email}: ${insertErr.message}`);
        continue;
      }

      results.imported++;

      // Send catch-up email if recent
      const leadDate = new Date(lead.createdAt);
      if (leadDate >= cutoff && resend && newLead) {
        try {
          await resend.emails.send({
            from: EMAIL_FROM,
            to: lead.email,
            subject: `${lead.firstName}, is your player still keen on football coaching?`,
            html: `
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1e293b;">
                <h2 style="margin:0 0 8px;">Hey ${lead.firstName},</h2>
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
          results.emailed++;
        } catch (emailErr) {
          results.errors.push(
            `Email to ${lead.email} failed: ${emailErr instanceof Error ? emailErr.message : "unknown"}`
          );
        }
      }
    } catch (err) {
      results.errors.push(
        `${lead.email}: ${err instanceof Error ? err.message : "unknown"}`
      );
    }
  }

  return NextResponse.json(results);
}
