/**
 * Email templates for the lead gen funnel.
 * Each template returns { subject, html } ready for Resend.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const BUSINESS_NAME = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? "CoachPlatform";
const COACH_NAME = process.env.COACH_NAME ?? "Coach";

/* ── Shared wrapper ── */
function wrap(body: string) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1e293b;">
      ${body}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0 16px;" />
      <p style="font-size:12px;color:#94a3b8;">
        ${BUSINESS_NAME} &middot; Football Coaching<br/>
        <a href="${APP_URL}" style="color:#94a3b8;">Visit our website</a>
      </p>
    </div>
  `;
}

function cta(text: string, url: string) {
  return `
    <a href="${url}" style="display:inline-block;padding:14px 28px;background:#0f172a;color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px;margin:8px 0;">
      ${text}
    </a>
  `;
}

/* ── Templates ── */

export type TemplateKey =
  | "welcome"
  | "followup_day1"
  | "followup_day3"
  | "followup_day7"
  | "booking_confirm"
  | "booking_reminder";

interface LeadData {
  firstName: string;
  childName?: string;
  ageGroup?: string;
}

interface BookingData {
  parentName: string;
  playerName: string;
  sessionType: string;
  date: string;
  time: string;
}

export function getEmailTemplate(
  key: TemplateKey,
  lead: LeadData,
  booking?: BookingData
): { subject: string; html: string } {
  const bookUrl = `${APP_URL}/book`;

  switch (key) {
    case "welcome":
      return {
        subject: `Welcome ${lead.firstName} — your free training guide is here`,
        html: wrap(`
          <h2 style="margin:0 0 8px;">Hey ${lead.firstName}!</h2>
          <p>Thanks for signing up${lead.childName ? ` for ${lead.childName}` : ""}. Here's what happens next:</p>
          <ol style="padding-left:20px;line-height:1.8;">
            <li>Your free weekly training guide is attached below</li>
            <li>Book a <strong>£2.50 trial session</strong> so we can see ${lead.childName ?? "your player"} in action</li>
            <li>We'll create a personalised development plan</li>
          </ol>
          ${cta("Book a £2.50 Trial Session", bookUrl)}
          <p style="margin-top:16px;">If you have any questions, just reply to this email.</p>
          <p>— ${COACH_NAME}</p>
        `),
      };

    case "followup_day1":
      return {
        subject: `${lead.firstName}, did you see our £2.50 trial offer?`,
        html: wrap(`
          <h2 style="margin:0 0 8px;">Hi ${lead.firstName},</h2>
          <p>Just a quick follow-up — I noticed you downloaded our training guide yesterday but haven't booked a trial session yet.</p>
          <p>Our £2.50 trial sessions fill up fast, and it's the best way to see if ${BUSINESS_NAME} is right for ${lead.childName ?? "your player"}.</p>
          <p><strong>What's included in the £2.50 trial:</strong></p>
          <ul style="padding-left:20px;line-height:1.8;">
            <li>60-minute coached session with qualified coaches</li>
            <li>Skills assessment for ${lead.childName ?? "your player"}</li>
            <li>Personalised feedback and development tips</li>
            <li>No commitment required</li>
          </ul>
          ${cta("Book Your £2.50 Trial", bookUrl)}
          <p>Spots are limited — grab one while they're available.</p>
          <p>— ${COACH_NAME}</p>
        `),
      };

    case "followup_day3":
      return {
        subject: `${lead.childName ?? "Your player"}'s development plan is waiting`,
        html: wrap(`
          <h2 style="margin:0 0 8px;">Hi ${lead.firstName},</h2>
          <p>I wanted to share something that might help ${lead.childName ?? "your player"}.</p>
          <p>Every player who comes to a trial session gets a <strong>free personalised development plan</strong> based on their:</p>
          <ul style="padding-left:20px;line-height:1.8;">
            <li>Current skill level and position</li>
            <li>Areas for improvement</li>
            <li>Specific drills they can do at home</li>
            <li>Weekly training structure</li>
          </ul>
          <p>Parents tell us this plan alone is worth the visit — even if you decide not to continue with regular sessions.</p>
          ${cta("Claim Your £2.50 Trial + Plan", bookUrl)}
          <p>— ${COACH_NAME}</p>
        `),
      };

    case "followup_day7":
      return {
        subject: `Last chance: £2.50 trial for ${lead.childName ?? "your player"}`,
        html: wrap(`
          <h2 style="margin:0 0 8px;">Hi ${lead.firstName},</h2>
          <p>This is my last email about the £2.50 trial — I don't want to clog your inbox!</p>
          <p>If now isn't the right time, no worries at all. But if ${lead.childName ?? "your player"} is keen to improve, our door is always open.</p>
          <p><strong>Quick recap of what you get for just £2.50:</strong></p>
          <ul style="padding-left:20px;line-height:1.8;">
            <li>60-minute coached trial session</li>
            <li>Skills assessment + personalised development plan</li>
            <li>Access to our online training hub</li>
          </ul>
          ${cta("Book Before Spots Fill Up", bookUrl)}
          <p>Hope to see ${lead.childName ?? "your player"} on the pitch soon.</p>
          <p>— ${COACH_NAME}</p>
        `),
      };

    case "booking_confirm":
      return {
        subject: `Booking confirmed — see you ${booking?.date ?? "soon"}!`,
        html: wrap(`
          <h2 style="margin:0 0 8px;">You're booked in, ${booking?.parentName ?? lead.firstName}!</h2>
          <p>Great news — here are your session details:</p>
          <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:16px 0;">
            <p style="margin:4px 0;"><strong>Player:</strong> ${booking?.playerName ?? lead.childName ?? "—"}</p>
            <p style="margin:4px 0;"><strong>Session:</strong> ${booking?.sessionType ?? "Trial Session"}</p>
            <p style="margin:4px 0;"><strong>Date:</strong> ${booking?.date ?? "TBC"}</p>
            <p style="margin:4px 0;"><strong>Time:</strong> ${booking?.time ?? "TBC"}</p>
          </div>
          <p><strong>What to bring:</strong></p>
          <ul style="padding-left:20px;line-height:1.8;">
            <li>Football boots and shin pads</li>
            <li>Water bottle</li>
            <li>Comfortable training kit</li>
          </ul>
          <p>If you need to reschedule, just reply to this email.</p>
          <p>See you on the pitch!</p>
          <p>— ${COACH_NAME}</p>
        `),
      };

    case "booking_reminder":
      return {
        subject: `Reminder: ${booking?.playerName ?? lead.childName ?? "your player"}'s session is tomorrow`,
        html: wrap(`
          <h2 style="margin:0 0 8px;">See you tomorrow, ${booking?.parentName ?? lead.firstName}!</h2>
          <p>Just a reminder about your session:</p>
          <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:16px 0;">
            <p style="margin:4px 0;"><strong>Player:</strong> ${booking?.playerName ?? lead.childName ?? "—"}</p>
            <p style="margin:4px 0;"><strong>Session:</strong> ${booking?.sessionType ?? "Trial Session"}</p>
            <p style="margin:4px 0;"><strong>Date:</strong> ${booking?.date ?? "TBC"}</p>
            <p style="margin:4px 0;"><strong>Time:</strong> ${booking?.time ?? "TBC"}</p>
          </div>
          <p>Remember to bring boots, shin pads, and a water bottle. Arrive 5 minutes early so we can get started on time.</p>
          <p>— ${COACH_NAME}</p>
        `),
      };
  }
}
