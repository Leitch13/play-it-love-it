import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Payment Successful – Coaching Platform" };

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Payment successful!</h1>
        <p className="mt-2 text-slate-500">
          You now have full access to the Training Hub. Welcome aboard.
        </p>
      </div>
      <Button className="rounded-2xl px-8" asChild>
        <Link href="/hub">Go to Training Hub</Link>
      </Button>
    </div>
  );
}
