import { NextResponse } from "next/server";

/**
 * Facebook Lead Ads Webhook
 *
 * Two ways to connect Facebook leads to this endpoint:
 *
 * 1. MAKE.COM (recommended for free tier):
 *    - Facebook Lead Ads trigger → HTTP module → POST to this endpoint
 *    - Map fields: firstName, email, phone, childName, ageGroup
 *
 * 2. DIRECT FACEBOOK WEBHOOK (requires business verification):
 *    - Set this URL as your webhook in Facebook App settings
 *    - GET handles verification, POST handles lead data
 *
 * The endpoint forwards to /api/leads which handles CRM + email automation.
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

    // Check if this is a direct Facebook webhook payload
    if (body.entry) {
      return handleFacebookWebhook(body);
    }

    // Otherwise treat as Make.com / Zapier mapped payload
    return handleMappedPayload(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("Facebook lead webhook error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Handle direct Facebook Graph API webhook format */
async function handleFacebookWebhook(body: {
  entry?: Array<{
    changes?: Array<{
      value?: {
        leadgen_id?: string;
        field_data?: Array<{ name: string; values: string[] }>;
      };
    }>;
  }>;
}) {
  const entries = body.entry ?? [];

  for (const entry of entries) {
    const changes = entry.changes ?? [];
    for (const change of changes) {
      const fieldData = change.value?.field_data ?? [];

      const fields: Record<string, string> = {};
      for (const f of fieldData) {
        fields[f.name.toLowerCase()] = f.values[0] ?? "";
      }

      // Forward to leads API
      await forwardToLeadsApi({
        firstName:
          fields["first_name"] || fields["full_name"]?.split(" ")[0] || "Facebook Lead",
        email: fields["email"] ?? "",
        phone: fields["phone_number"] || fields["phone"] || undefined,
        childName: fields["child_name"] || fields["player_name"] || undefined,
        ageGroup: fields["age_group"] || undefined,
        source: "facebook",
      });
    }
  }

  return NextResponse.json({ success: true });
}

/** Handle pre-mapped payload from Make.com / Zapier */
async function handleMappedPayload(body: {
  firstName?: string;
  email?: string;
  phone?: string;
  childName?: string;
  ageGroup?: string;
  utmCampaign?: string;
  utmSource?: string;
}) {
  if (!body.email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  await forwardToLeadsApi({
    firstName: body.firstName ?? "Facebook Lead",
    email: body.email,
    phone: body.phone,
    childName: body.childName,
    ageGroup: body.ageGroup,
    source: "facebook",
    utmCampaign: body.utmCampaign,
    utmSource: body.utmSource ?? "facebook",
  });

  return NextResponse.json({ success: true });
}

/** Forward to the main leads endpoint for CRM + email automation */
async function forwardToLeadsApi(data: Record<string, string | undefined>) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  await fetch(`${appUrl}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
