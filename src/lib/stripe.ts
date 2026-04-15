import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "STRIPE_SECRET_KEY is not set — payments disabled. Add it to .env.local to enable."
  );
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-03-31.basil",
    })
  : null;

export const STRIPE_PRICE_HUB_MONTHLY =
  process.env.STRIPE_PRICE_HUB_MONTHLY ?? "";
