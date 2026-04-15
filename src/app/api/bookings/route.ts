import { NextResponse } from "next/server";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/server";
import { getEmailTemplate } from "@/lib/emails";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      parentName,
      parentEmail,
      parentPhone,
      playerName,
      playerAge,
      sessionType,
      preferredDate,
      preferredTime,
      notes,
    } = body as {
      parentName: string;
      parentEmail: string;
      parentPhone?: string;
      playerName: string;
      playerAge?: string;
      sessionType: string;
      preferredDate: string;
      preferredTime: string;
      notes?: string;
    };

    if (!parentName || !parentEmail || !playerName || !sessionType || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // 1. Check if this person is already a lead — if so, link booking
    const { data: existingLead } = await supabase
      .from("leads")
      .select("id")
      .eq("email", parentEmail.toLowerCase().trim())
      .limit(1)
      .single();

    let leadId = existingLead?.id ?? null;

    // If not a lead yet, create one
    if (!leadId) {
      const { data: newLead } = await supabase
        .from("leads")
        .insert({
          first_name: parentName,
          email: parentEmail.toLowerCase().trim(),
          phone: parentPhone ?? null,
          child_name: playerName,
          age_group: playerAge ?? null,
          source: "booking",
          status: "booked",
        })
        .select()
        .single();
      leadId = newLead?.id ?? null;
    } else {
      // Update lead status to booked
      await supabase
        .from("leads")
        .update({
          status: "booked",
          booked_at: new Date().toISOString(),
        })
        .eq("id", leadId);

      // Cancel pending follow-up emails (they booked!)
      await supabase
        .from("email_sequences")
        .update({ cancelled_at: new Date().toISOString() })
        .eq("lead_id", leadId)
        .is("sent_at", null)
        .is("cancelled_at", null);
    }

    // 2. Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        lead_id: leadId,
        parent_name: parentName,
        parent_email: parentEmail.toLowerCase().trim(),
        parent_phone: parentPhone ?? null,
        player_name: playerName,
        player_age: playerAge ?? null,
        session_type: sessionType,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        notes: notes ?? null,
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking error:", bookingError);
      return NextResponse.json(
        { error: "Could not create booking." },
        { status: 500 }
      );
    }

    // 3. Schedule booking confirmation + reminder emails
    if (leadId) {
      const reminderDate = new Date(preferredDate);
      reminderDate.setDate(reminderDate.getDate() - 1);
      reminderDate.setHours(9, 0, 0, 0);

      await supabase.from("email_sequences").insert([
        {
          lead_id: leadId,
          template_key: "booking_confirm",
          scheduled_for: new Date().toISOString(),
        },
        {
          lead_id: leadId,
          template_key: "booking_reminder",
          scheduled_for: reminderDate.toISOString(),
        },
      ]);
    }

    // 4. Send confirmation email immediately
    const sessionLabel =
      sessionType === "trial"
        ? "Free Trial Session"
        : sessionType === "group"
          ? "Group Coaching"
          : sessionType === "one_on_one"
            ? "1-on-1 Coaching"
            : "Holiday Camp";

    if (resend) {
      const { subject, html } = getEmailTemplate(
        "booking_confirm",
        { firstName: parentName, childName: playerName },
        {
          parentName,
          playerName,
          sessionType: sessionLabel,
          date: preferredDate,
          time: preferredTime,
        }
      );

      await resend.emails.send({
        from: EMAIL_FROM,
        to: parentEmail,
        subject,
        html,
      });

      // Mark as sent
      if (leadId) {
        await supabase
          .from("email_sequences")
          .update({ sent_at: new Date().toISOString() })
          .eq("lead_id", leadId)
          .eq("template_key", "booking_confirm")
          .is("sent_at", null);
      }

      // Notify coach
      if (process.env.COACH_EMAIL) {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: process.env.COACH_EMAIL,
          subject: `New booking: ${playerName} — ${sessionLabel} on ${preferredDate}`,
          html: `
            <h3>New Booking</h3>
            <ul>
              <li><strong>Parent:</strong> ${parentName} (${parentEmail})</li>
              <li><strong>Phone:</strong> ${parentPhone ?? "Not provided"}</li>
              <li><strong>Player:</strong> ${playerName} (${playerAge ?? "—"})</li>
              <li><strong>Session:</strong> ${sessionLabel}</li>
              <li><strong>Date:</strong> ${preferredDate} at ${preferredTime}</li>
              <li><strong>Notes:</strong> ${notes ?? "None"}</li>
            </ul>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads">View in CRM</a></p>
          `,
        });
      }
    }

    return NextResponse.json({ success: true, bookingId: booking?.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("Booking error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
