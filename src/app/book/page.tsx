"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  Star,
  Users,
  CheckCircle2,
  Shield,
  Trophy,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const SESSION_TYPES = [
  {
    id: "trial",
    title: "Free Trial Session",
    duration: "60 min",
    price: "Free",
    description: "Skills assessment + personalised feedback",
    badge: "Most Popular",
    icon: Trophy,
  },
  {
    id: "group",
    title: "Group Coaching",
    duration: "60 min",
    price: "From \u00a315/session",
    description: "Small group sessions (max 8 players)",
    badge: null,
    icon: Users,
  },
  {
    id: "one_on_one",
    title: "1-on-1 Coaching",
    duration: "45 min",
    price: "From \u00a340/session",
    description: "Intensive individual development",
    badge: "Premium",
    icon: Zap,
  },
  {
    id: "holiday_camp",
    title: "Holiday Camp",
    duration: "Full day",
    price: "From \u00a345/day",
    description: "School holiday training camps",
    badge: null,
    icon: Star,
  },
];

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export default function BookingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [form, setForm] = useState({
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    playerName: "",
    playerAge: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!selectedSession) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sessionType: selectedSession,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Booking failed");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-950 to-emerald-900 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-400">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">You&apos;re Booked In!</h1>
          <p className="mt-3 text-emerald-200">
            We&apos;ve sent a confirmation email to <strong className="text-white">{form.parentEmail}</strong> with
            all the details.
          </p>
          <div className="mt-6 rounded-2xl bg-white/10 backdrop-blur-sm p-5 text-left border border-white/10">
            <p className="text-sm text-emerald-300">Your booking</p>
            <p className="font-semibold mt-1 text-white text-lg">
              {SESSION_TYPES.find((s) => s.id === selectedSession)?.title}
            </p>
            <p className="text-sm text-emerald-200 mt-1">
              {form.playerName} &middot; {form.preferredDate} at {form.preferredTime}
            </p>
          </div>
          <div className="mt-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
            <p className="text-sm text-amber-200">
              <strong>Remember to bring:</strong> boots, shin pads, and a water bottle. Arrive 5 minutes early!
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-950 to-slate-950">
      {/* Hero header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-800/30 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl px-6 pt-12 pb-8 text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Play It Love It
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Badge className="mb-4 rounded-full bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-4 py-1.5 text-sm">
              Limited Spots Available
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Book Your Football<br />Coaching Session
            </h1>
            <p className="mt-4 text-lg text-emerald-200/80 max-w-xl mx-auto">
              Professional coaching for players aged 6-16. Choose your session, pick a time, and we&apos;ll see you on the pitch.
            </p>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-emerald-300/70"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> FA Qualified Coaches
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Free Trial Available
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> No Commitment
            </span>
          </motion.div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="border-y border-white/5 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-8 px-6 py-4">
          {[
            { n: 1, label: "Choose Session" },
            { n: 2, label: "Your Details" },
            { n: 3, label: "Pick a Time" },
          ].map(({ n, label }) => (
            <button
              key={n}
              onClick={() => {
                if (n === 1) setStep(1);
                if (n === 2 && selectedSession) setStep(2);
                if (
                  n === 3 &&
                  selectedSession &&
                  form.parentName &&
                  form.parentEmail &&
                  form.playerName
                )
                  setStep(3);
              }}
              className="flex items-center gap-2 text-sm"
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  step >= n
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                    : "bg-white/10 text-white/40"
                }`}
              >
                {step > n ? <CheckCircle2 className="h-4 w-4" /> : n}
              </div>
              <span
                className={`hidden sm:inline ${
                  step >= n ? "font-medium text-white" : "text-white/40"
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {/* Step 1: Choose session */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {SESSION_TYPES.map((s) => {
              const Icon = s.icon;
              return (
                <Card
                  key={s.id}
                  className={`cursor-pointer rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10 ${
                    selectedSession === s.id
                      ? "ring-2 ring-emerald-400 bg-emerald-500/10"
                      : "hover:ring-1 hover:ring-white/20"
                  }`}
                  onClick={() => setSelectedSession(s.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          selectedSession === s.id ? "bg-emerald-500/20" : "bg-white/10"
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            selectedSession === s.id ? "text-emerald-400" : "text-white/60"
                          }`} />
                        </div>
                        <CardTitle className="text-base text-white">{s.title}</CardTitle>
                      </div>
                      {s.badge && (
                        <Badge className="rounded-full text-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          {s.badge}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-white/50 ml-[42px]">{s.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-white/50 ml-[42px]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {s.duration}
                      </span>
                      <span className="font-semibold text-emerald-400">
                        {s.price}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            <div className="sm:col-span-2 flex justify-end mt-2">
              <Button
                className="rounded-2xl px-8 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/20"
                disabled={!selectedSession}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Your Details</CardTitle>
                <CardDescription className="text-white/50">
                  Tell us about yourself and your player.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label className="text-white/70">Your name *</Label>
                    <Input
                      value={form.parentName}
                      onChange={(e) => update("parentName", e.target.value)}
                      placeholder="Your full name"
                      className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-400 focus:ring-emerald-400/20"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-white/70">Email *</Label>
                    <Input
                      type="email"
                      value={form.parentEmail}
                      onChange={(e) => update("parentEmail", e.target.value)}
                      placeholder="your@email.com"
                      className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-400 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-white/70">Phone number</Label>
                  <Input
                    type="tel"
                    value={form.parentPhone}
                    onChange={(e) => update("parentPhone", e.target.value)}
                    placeholder="07xxx xxx xxx"
                    className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-400 focus:ring-emerald-400/20"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label className="text-white/70">Player name *</Label>
                    <Input
                      value={form.playerName}
                      onChange={(e) => update("playerName", e.target.value)}
                      placeholder="Player's first name"
                      className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-400 focus:ring-emerald-400/20"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-white/70">Player age group</Label>
                    <Select
                      value={form.playerAge}
                      onValueChange={(v) => update("playerAge", v)}
                    >
                      <SelectTrigger className="bg-white/10 border-white/10 text-white">
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="U6-U8">U6-U8</SelectItem>
                        <SelectItem value="U8-U10">U8-U10</SelectItem>
                        <SelectItem value="U10-U12">U10-U12</SelectItem>
                        <SelectItem value="U13-U16">U13-U16</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-white/70">Anything we should know?</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Position preference, injuries, experience level..."
                    rows={3}
                    className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-400 focus:ring-emerald-400/20"
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <Button
                    variant="outline"
                    className="rounded-2xl border-white/20 text-white hover:bg-white/10"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    className="rounded-2xl px-8 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/20"
                    disabled={
                      !form.parentName || !form.parentEmail || !form.playerName
                    }
                    onClick={() => setStep(3)}
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Time picker */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Pick a Time</CardTitle>
                <CardDescription className="text-white/50">
                  Choose your preferred date and time slot.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="text-white/70">Preferred date *</Label>
                  <Input
                    type="date"
                    value={form.preferredDate}
                    onChange={(e) => update("preferredDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="bg-white/10 border-white/10 text-white focus:border-emerald-400 focus:ring-emerald-400/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-white/70">Preferred time *</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        onClick={() => update("preferredTime", t)}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                          form.preferredTime === t
                            ? "border-emerald-400 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {/* Summary */}
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5 mt-2">
                  <p className="text-sm font-medium text-emerald-300 mb-3">
                    Booking Summary
                  </p>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2 text-white/70">
                      <Star className="h-4 w-4 text-emerald-400" />
                      <span>
                        {SESSION_TYPES.find((s) => s.id === selectedSession)
                          ?.title ?? "\u2014"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Users className="h-4 w-4 text-emerald-400" />
                      <span>{form.playerName || "\u2014"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <CalendarDays className="h-4 w-4 text-emerald-400" />
                      <span>{form.preferredDate || "\u2014"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock className="h-4 w-4 text-emerald-400" />
                      <span>{form.preferredTime || "\u2014"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <MapPin className="h-4 w-4 text-emerald-400" />
                      <span>Location confirmed after booking</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-2">
                  <Button
                    variant="outline"
                    className="rounded-2xl border-white/20 text-white hover:bg-white/10"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    className="rounded-2xl px-8 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/20"
                    disabled={
                      !form.preferredDate || !form.preferredTime || submitting
                    }
                    onClick={handleSubmit}
                  >
                    {submitting ? "Booking..." : "Confirm Booking"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <div className="border-t border-white/5 mt-8">
        <div className="mx-auto max-w-3xl px-6 py-8 text-center">
          <p className="text-sm text-white/30">
            Play It Love It &middot; Professional Football Coaching
          </p>
        </div>
      </div>
    </div>
  );
}
