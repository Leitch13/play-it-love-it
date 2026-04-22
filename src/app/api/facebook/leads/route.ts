import { NextResponse } from "next/server";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/server";
import { getEmailTemplate } from "@/lib/emails";

/**
 * Facebook Lead Ads Webhook
 * Receives leads from Make.com or direct Facebook webhook.
 * Saves lead directly to DB and sends welcome email.
 */

// Facebook webhook verification (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Receive leads (POST) — from Make.com or direct Facebook webhook
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[FB webhook] received:", JSON.stringify(body).slice(0, 500));

    let leadData: LeadPayload;

    // Check if this is a direct Facebook webhook payload
    if (body.entry) {
      leadData = extractFromFacebookWebhook(body);
    } else {
      leadData = extractFromMappedPayload(body);
    }

    if (!leadData.email) {
      console.warn("[FB webhook] no email in payload — rejecting");
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await saveLeadAndSendEmails(leadData);
    return NextResponse.json({ success: true, email: leadData.email });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("[FB webhook] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface LeadPayload {
  firstName: string;
  email: string;
  phone?: string;
  childName?: string;
  ageGroup?: string;
  utmCampaign?: string;
  utmSource: string;
}

/** Extract from direct Facebook Graph API webhook format */
function extractFromFacebookWebhook(body: {
  entry?: Array<{
    changes?: Array<{
      value?: { field_data?: Array<{ name: string; values: string[] }> };
    }>;
  }>;
}): LeadPayload {
  const fields: Record<string, string> = {};
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const f of change.value?.field_data ?? []) {
        fields[f.name.toLowerCase()] = f.values[0] ?? "";
      }
    }
  }

  return {
    firstName:
      fields["first_name"] || fields["full_name"]?.split(" ")[0] || "Facebook Lead",
    email: fields["email"] ?? "",
    phone: fields["phone_number"] || fields["phone"] || undefined,
    childName: fields["child_name"] || fields["player_name"] || undefined,
    ageGroup: fields["age_group"] || undefined,
    utmSource: "facebook",
  };
}

/** Extract from pre-mapped Make.com/Zapier payload */
function extractFromMappedPayload(body: Record<string, unknown>): LeadPayload {
  // Deep search — Make.com sometimes nests Facebook data, so hunt for common field names
  const flat = flattenObject(body);

  const findField = (keys: string[]): string | undefined => {
    for (const key of keys) {
      for (const [k, v] of Object.entries(flat)) {
        if (k.toLowerCase().includes(key.toLowerCase()) && typeof v === "string" && v.trim()) {
          return v.trim();
        }
      }
    }
    return undefined;
  };

  const email = findField(["email"]) ?? "";
  const firstName =
    findField(["firstName", "first_name"]) ??
    findField(["full_name", "fullname", "name"])?.split(" ")[0] ??
    "Facebook Lead";
  const phone = findField(["phone_number", "phone"]);
  const childName = findField(["childName", "child_name", "player_name"]);
  const ageGroup = findField(["ageGroup", "age_group", "age"]);
  const utmCampaign = findField(["utmCampaign", "utm_campaign", "campaign"]);
  const utmSource = findField(["utmSource", "utm_source"]) ?? "facebook";

  return { firstName, email, phone, childName, ageGroup, utmCampaign, utmSource };
}

/** Flatten nested object so we can search all field names and values */
function flattenObject(
  obj: unknown,
  prefix = "",
  result: Record<string, unknown> = {}
): Record<string, unknown> {
  if (obj === null || typeof obj !== "object") return result;

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenObject(value, newKey, result);
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => flattenObject(item, `${newKey}[${i}]`, result));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

/** Save lead directly to DB and trigger welcome email + coach notification */
async function saveLeadAndSendEmails(data: LeadPayload) {
  const supabase = await createServiceClient();

  if (!supabase) {
    console.error("[FB webhook] Supabase not configured");
    return;
  }

  // Save lead
  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      first_name: data.firstName,
      email: data.email.toLowerCase().trim(),
      phone: data.phone ?? null,
      child_name: data.childName ?? null,
      age_group: data.ageGroup ?? null,
      source: "facebook",
      utm_campaign: data.utmCampaign ?? null,
      utm_source: data.utmSource,
      status: "new",
    })
    .select()
    .single();

  if (error) {
    console.error("[FB webhook] lead insert error:", error.message);
    return;
  }

  console.log("[FB webhook] lead saved:", lead?.id);

  // Schedule email sequence
  if (lead) {
    const now = new Date();
    const sequences = [
      { template_key: "followup_day1", delay_hours: 24 },
      { template_key: "followup_day3", delay_hours: 72 },
      { template_key: "followup_day7", delay_hours: 168 },
    ];

    await supabase.from("email_sequences").insert(
      sequences.map((s) => ({
        lead_id: lead.id,
        template_key: s.template_key,
        scheduled_for: new Date(
          now.getTime() + s.delay_hours * 60 * 60 * 1000
        ).toISOString(),
      }))
    );
  }

  // Send welcome email + coach notification
  if (resend) {
    try {
      const { subject, html } = getEmailTemplate("welcome", {
        firstName: data.firstName,
        childName: data.childName,
        ageGroup: data.ageGroup,
      });

      await resend.emails.send({
        from: EMAIL_FROM,
        to: data.email,
        subject,
        html,
      });

      if (lead) {
        await supabase
          .from("leads")
          .update({ status: "contacted" })
          .eq("id", lead.id);
      }

      // Coach notification
      if (process.env.COACH_EMAIL) {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: process.env.COACH_EMAIL,
          subject: `New Facebook lead: ${data.firstName} (${data.email})`,
          html: `
            <h3>New lead from Facebook Ad</h3>
            <ul>
              <li><strong>Name:</strong> ${data.firstName}</li>
              <li><strong>Email:</strong> ${data.email}</li>
              <li><strong>Phone:</strong> ${data.phone ?? "Not provided"}</li>
              <li><strong>Campaign:</strong> ${data.utmCampaign ?? "N/A"}</li>
            </ul>
          `,
        });
      }
    } catch (emailErr) {
      console.error("[FB webhook] email error:", emailErr);
    }
  }
}
