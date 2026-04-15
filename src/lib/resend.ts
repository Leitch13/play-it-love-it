import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn(
    "RESEND_API_KEY is not set — email sending is disabled. Add it to .env.local to enable."
  );
}

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "noreply@coachplatform.com";
