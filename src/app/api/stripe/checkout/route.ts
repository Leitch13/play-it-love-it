import { NextResponse } from "next/server";
import { stripe, STRIPE_PRICE_HUB_MONTHLY } from "@/lib/stripe";
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

    if (!stripe) {
      return NextResponse.json({ error: "Payments not configured" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const priceId: string = body.priceId ?? STRIPE_PRICE_HUB_MONTHLY;

    if (!priceId) {
      return NextResponse.json(
        { error: "STRIPE_PRICE_HUB_MONTHLY is not configured." },
        { status: 500 }
      );
    }

    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      customer_email: user.email,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/hub`,
      metadata: { userId: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
