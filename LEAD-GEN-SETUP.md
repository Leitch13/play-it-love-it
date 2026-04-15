# Lead Gen Automation Setup Guide

Everything is built into your Next.js app. Follow these steps to go live.

---

## 1. Environment Variables

Add these to your `.env.local` (and Vercel dashboard):

```env
# Existing (should already be set)
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=coach@your-domain.com

# New — Add these
COACH_EMAIL=your@email.com                    # Where you get lead notifications
COACH_NAME=Coach John                          # Used in email templates
NEXT_PUBLIC_BUSINESS_NAME=Your Academy Name    # Used in emails and branding
CRON_SECRET=generate-a-random-string-here      # Protects the cron endpoint
FACEBOOK_VERIFY_TOKEN=a-secret-token-you-choose # For Facebook webhook verification
```

---

## 2. Run the Database Migration

In the Supabase SQL editor, run the contents of:
```
supabase/migrations/001_leads_and_bookings.sql
```

This creates three new tables: `leads`, `email_sequences`, and `bookings`.

---

## 3. Deploy to Vercel

```bash
git add .
git commit -m "Add lead gen automation system"
vercel --prod
```

The `vercel.json` cron config will automatically run `/api/cron/follow-ups` every 15 minutes to send scheduled follow-up emails.

---

## 4. Connect Facebook Lead Ads (via Make.com — Free)

### Step 1: Create a Make.com account
Go to [make.com](https://www.make.com) and sign up (free tier = 1,000 ops/month).

### Step 2: Create a new Scenario
1. **Trigger:** Facebook Lead Ads → Watch New Leads
2. **Action:** HTTP → Make a Request
   - URL: `https://your-domain.com/api/facebook/leads`
   - Method: POST
   - Headers: `Content-Type: application/json`
   - Body:
   ```json
   {
     "firstName": "{{first_name}}",
     "email": "{{email}}",
     "phone": "{{phone_number}}",
     "childName": "{{child_name}}",
     "ageGroup": "{{age_group}}",
     "utmCampaign": "{{ad_name}}",
     "utmSource": "facebook"
   }
   ```

### Step 3: Map your Facebook form fields
In your Facebook Lead Ad form, make sure you have these fields:
- First Name (standard)
- Email (standard)
- Phone Number (standard)
- Child Name (custom question)
- Age Group (custom question — dropdown: U6-U8, U8-U10, U10-U12, U13-U16)

### Step 4: Turn on the scenario
Set it to run "Immediately" (or every 15 minutes on free tier).

---

## 5. Facebook Ad Setup

### Campaign Structure
```
Campaign: Football Coaching Lead Gen
├── Ad Set 1: Parents, 25-45, 10km radius
│   ├── Ad: Free Trial (use Canva Facebook post design)
│   └── Ad: Social Proof (use Canva testimonial design)
└── Ad Set 2: Retargeting (website visitors)
    └── Ad: Story format (use Canva story design)
```

### Recommended Facebook Ad Settings
- **Objective:** Leads
- **Form type:** More volume (Instant Form)
- **UTM tracking:** Add to your ad URL:
  `?utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}`

### Facebook Lead Form Fields
1. First Name (pre-filled)
2. Email (pre-filled)
3. Phone Number (pre-filled)
4. "What is your child's name?" (short answer)
5. "What age group?" (multiple choice: U6-U8, U8-U10, U10-U12, U13-U16)

### Thank You Page
Set the thank you page URL to: `https://your-domain.com/book`
This sends leads directly to your booking page after form submission.

---

## 6. Landing Page UTM Tracking

When linking to your landing page from ads, add UTM parameters:
```
https://your-domain.com/?utm_source=facebook&utm_medium=paid&utm_campaign=free-trial-spring
```

The landing page automatically captures these and stores them with each lead.

---

## How the Automation Works

```
Lead enters (Facebook Ad / Landing Page / Direct Booking)
    │
    ├── Instantly: Lead saved to CRM (leads table)
    ├── Instantly: Welcome email sent with booking link
    ├── Instantly: Coach notified via email
    │
    ├── +24 hours: Follow-up #1 (if not booked)
    ├── +3 days:   Follow-up #2 (if not booked)
    ├── +7 days:   Follow-up #3 — final (if not booked)
    │
    └── When they book:
        ├── All pending follow-ups cancelled
        ├── Booking confirmation email sent
        ├── Reminder email scheduled for day before
        └── Coach notified with booking details
```

---

## Pages Built

| Page | URL | Purpose |
|------|-----|---------|
| Landing Page | `/` | Lead magnet form with UTM tracking |
| Booking Page | `/book` | 3-step booking flow (session → details → time) |
| Leads CRM | `/dashboard/leads` | View all leads, statuses, and upcoming bookings |
| Coach Dashboard | `/dashboard` | Overview with quick links |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/leads` | POST | Capture lead + trigger email sequence |
| `/api/bookings` | POST | Create booking + send confirmations |
| `/api/cron/follow-ups` | POST/GET | Send due follow-up emails (called by Vercel Cron) |
| `/api/facebook/leads` | POST | Receive leads from Make.com / Facebook webhook |
| `/api/facebook/leads` | GET | Facebook webhook verification |

---

## Email Sequence

| Template | Timing | Purpose |
|----------|--------|---------|
| Welcome | Instant | Thank you + booking link + free guide |
| Follow-up Day 1 | +24h | Reminder about free trial offer |
| Follow-up Day 3 | +3 days | Development plan value proposition |
| Follow-up Day 7 | +7 days | Final gentle nudge |
| Booking Confirm | On booking | Session details + what to bring |
| Booking Reminder | Day before | Reminder with session details |

---

## Canva Designs Created

- **Facebook Ad Creative** — Free trial session promotion
- **Instagram Testimonial** — Social proof / parent review post
- **Instagram Story** — Swipe-up trial session ad

Pick your favourites from the options provided and they'll be saved to your Canva account.

---

## Optional: Direct Facebook Webhook (No Make.com)

If you want to skip Make.com and connect Facebook directly:

1. Create a Facebook App at [developers.facebook.com](https://developers.facebook.com)
2. Add the "Webhooks" product
3. Subscribe to `leadgen` events
4. Set webhook URL: `https://your-domain.com/api/facebook/leads`
5. Set verify token to match your `FACEBOOK_VERIFY_TOKEN` env var
6. Use the Graph API to fetch lead data when webhook fires

Note: This requires Facebook Business Verification, which takes a few days.
