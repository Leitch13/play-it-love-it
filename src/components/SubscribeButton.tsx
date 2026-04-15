"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Could not start checkout.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      <Button
        className="w-full rounded-2xl"
        onClick={handleSubscribe}
        disabled={loading}
      >
        {loading ? "Redirecting…" : "Join the hub — Subscribe"}
      </Button>
    </div>
  );
}
