import { NextResponse } from "next/server";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId, subject, messageBody, recipientEmail } = body as {
      recipientId: string;
      subject: string;
      messageBody: string;
      recipientEmail?: string;
    };

    if (!recipientId || !messageBody) {
      return NextResponse.json({ error: "recipient_id and body are required." }, { status: 400 });
    }

    // Save to DB
    const { error: dbError } = await supabase.from("messages").insert({
      sender_id: user.id,
      recipient_id: recipientId,
      subject,
      body: messageBody,
    });

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Send email if we have the recipient's email and Resend is configured
    if (resend && recipientEmail) {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: recipientEmail,
        subject: subject ?? "New message from your coach",
        html: `
          <p>${messageBody.replace(/\n/g, "<br>")}</p>
          <hr>
          <p><small>Reply via the <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages">CoachPlatform messages inbox</a>.</small></p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
