import { NextResponse } from "next/server";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/server";
import { getEmailTemplate } from "@/lib/emails";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      email,
      childName,
      ageGroup,
      phone,
      source = "website",
      utmCampaign,
      utmSource,
      utmMedium,
    } = body as {
      firstName: string;
      email: string;
      childName?: string;
      ageGroup?: string;
      phone?: string;
      source?: string;
      utmCampaign?: string;
      utmSource?: string;
      utmMedium?: string;
    };

    if (!email || !firstName) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // 1. Upsert lead into leads table
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .upsert(
        {
          first_name: firstName,
          email: email.toLowerCase().trim(),
          phone: phone ?? null,
          child_name: childName ?? null,
          age_group: ageGroup ?? null,
          source,
          utm_campaign: utmCampaign ?? null,
          utm_source: utmSource ?? null,
          utm_medium: utmMedium ?? null,
          status: "new",
        },
        { onConflict: "email", ignoreDuplicates: false }
      )
      .select()
      .single();

    if (leadError) {
      console.error("Lead insert error:", leadError);
      // Try without upsert (email column might not have unique constraint yet)
      const { data: insertedLead } = await supabase
        .from("leads")
        .insert({
          first_name: firstName,
          email: email.toLowerCase().trim(),
          phone: phone ?? null,
          child_name: childName ?? null,
          age_group: ageGroup ?? null,
          source,
          utm_campaign: utmCampaign ?? null,
          utm_source: utmSource ?? null,
          utm_medium: utmMedium ?? null,
          status: "new",
        })
        .select()
        .single();

      if (insertedLead) {
        // Schedule email sequence for this lead
        await scheduleEmailSequence(supabase, insertedLead.id);
      }
    } else if (lead) {
      // Schedule email sequence
      await scheduleEmailSequence(supabase, lead.id);
    }

    // 2. Send welcome email immediately
    if (resend) {
      const { subject, html } = getEmailTemplate("welcome", {
        firstName,
        childName,
        ageGroup,
      });

      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject,
        html,
      });

      // Mark welcome as sent
      const leadId = lead?.id;
      if (leadId) {
        await supabase
          .from("email_sequences")
          .update({ sent_at: new Date().toISOString() })
          .eq("lead_id", leadId)
          .eq("template_key", "welcome");

        // Update lead status to contacted
        await supabase
          .from("leads")
          .update({ status: "contacted" })
          .eq("id", leadId);
      }

      // 3. Notify coach
      if (process.env.COACH_EMAIL) {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: process.env.COACH_EMAIL,
          subject: `New lead: ${firstName} (${email})`,
          html: `
            <h3>New lead from ${source}</h3>
            <ul>
              <li><strong>Name:</strong> ${firstName}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Phone:</strong> ${phone ?? "Not provided"}</li>
              <li><strong>Child:</strong> ${childName ?? "Not provided"}</li>
              <li><strong>Age group:</strong> ${ageGroup ?? "Not provided"}</li>
              <li><strong>Source:</strong> ${source}</li>
              ${utmCampaign ? `<li><strong>Campaign:</strong> ${utmCampaign}</li>` : ""}
            </ul>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads">View in CRM</a></p>
          `,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("Lead capture error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Schedule the full email follow-up sequence for a new lead */
async function scheduleEmailSequence(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  leadId: string
) {
  const now = new Date();
  const sequences = [
    { template_key: "welcome", delay_hours: 0 },
    { template_key: "followup_day1", delay_hours: 24 },
    { template_key: "followup_day3", delay_hours: 72 },
    { template_key: "followup_day7", delay_hours: 168 },
  ];

  const rows = sequences.map((s) => ({
    lead_id: leadId,
    template_key: s.template_key,
    scheduled_for: new Date(
      now.getTime() + s.delay_hours * 60 * 60 * 1000
    ).toISOString(),
  }));

  await supabase.from("email_sequences").insert(rows);
}
