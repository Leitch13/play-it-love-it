import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is not set. Add it to .env.local to enable payments."
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-03-31.basil",
});

export const STRIPE_PRICE_HUB_MONTHLY =
  process.env.STRIPE_PRICE_HUB_MONTHLY ?? "";
