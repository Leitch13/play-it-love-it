"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Goal, Mail, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeatureMini } from "@/components/FeatureMini";

export default function LandingPage() {
  const [leadForm, setLeadForm] = useState({
    firstName: "",
    email: "",
    childName: "",
    ageGroup: "U10-U12",
    phone: "",
  });

  // Capture UTM params from URL
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    if (params.get("utm_campaign")) utm.utmCampaign = params.get("utm_campaign")!;
    if (params.get("utm_source")) utm.utmSource = params.get("utm_source")!;
    if (params.get("utm_medium")) utm.utmMedium = params.get("utm_medium")!;
    if (Object.keys(utm).length > 0) setUtmParams(utm);
  }, []);
  const [leadState, setLeadState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadState("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...leadForm, ...utmParams }),
      });
      setLeadState(res.ok ? "success" : "error");
    } catch {
      setLeadState("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero */}
      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col justify-center"
          >
            <Badge className="mb-4 w-fit rounded-full px-4 py-1 text-sm">
              Football Coaching Platform
            </Badge>
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
              Build better players with structured plans, a clean training hub, and smart parent communication.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              This Phase 1 starter gives you a funnel, a plan generator, and a dashboard foundation you can expand into your full coaching business.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button className="rounded-2xl px-6">Start Free Trial</Button>
              <Button variant="outline" className="rounded-2xl px-6" asChild>
                <Link href="/dashboard">
                  View Demo <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FeatureMini icon={Goal} title="Plan Generator" subtitle="Personal weekly plans" />
              <FeatureMini icon={PlayCircle} title="Training Hub" subtitle="Sessions and resources" />
              <FeatureMini icon={Mail} title="Parent Comms" subtitle="Ready for Phase 2" />
            </div>
          </motion.div>

          {/* Lead capture */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="rounded-3xl border-none shadow-lg">
              <CardHeader>
                <CardTitle>Get the free weekly training guide</CardTitle>
                <CardDescription>
                  Capture leads from parents and players before launch.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {leadState === "success" && (
                  <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                    Guide is on its way — check your inbox!{" "}
                    <a href="/book" className="underline font-medium">
                      Book a free trial session
                    </a>
                  </div>
                )}
                {leadState === "error" && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    Something went wrong. Please try again.
                  </div>
                )}
                <div className="grid gap-2">
                  <Label>First name</Label>
                  <Input
                    value={leadForm.firstName}
                    onChange={(e) => setLeadForm((s) => ({ ...s, firstName: e.target.value }))}
                    placeholder="John"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    value={leadForm.email}
                    onChange={(e) => setLeadForm((s) => ({ ...s, email: e.target.value }))}
                    placeholder="parent@email.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Player name</Label>
                  <Input
                    value={leadForm.childName}
                    onChange={(e) => setLeadForm((s) => ({ ...s, childName: e.target.value }))}
                    placeholder="Mason"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Phone number</Label>
                  <Input
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm((s) => ({ ...s, phone: e.target.value }))}
                    placeholder="07xxx xxx xxx"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Age group</Label>
                  <Select
                    value={leadForm.ageGroup}
                    onValueChange={(v) => setLeadForm((s) => ({ ...s, ageGroup: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="U6-U8">U6–U8</SelectItem>
                      <SelectItem value="U8-U10">U8–U10</SelectItem>
                      <SelectItem value="U10-U12">U10–U12</SelectItem>
                      <SelectItem value="U13-U16">U13–U16</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="mt-2 rounded-2xl"
                  onClick={handleLeadSubmit}
                  disabled={leadState === "loading" || leadState === "success"}
                >
                  {leadState === "loading" ? "Sending…" : leadState === "success" ? "Sent!" : "Send me the guide"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Navigation strip */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl gap-2 px-6 py-4 lg:px-8">
          <Button variant="outline" className="rounded-2xl" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="outline" className="rounded-2xl" asChild>
            <Link href="/generator">Plan Generator</Link>
          </Button>
          <Button variant="outline" className="rounded-2xl" asChild>
            <Link href="/hub">Training Hub</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
