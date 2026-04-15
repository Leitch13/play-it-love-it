"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, MapPin, Star, Users, CheckCircle2 } from "lucide-react";
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
  },
  {
    id: "group",
    title: "Group Coaching",
    duration: "60 min",
    price: "From $15/session",
    description: "Small group sessions (max 8 players)",
    badge: null,
  },
  {
    id: "one_on_one",
    title: "1-on-1 Coaching",
    duration: "45 min",
    price: "From $40/session",
    description: "Intensive individual development",
    badge: "Premium",
  },
  {
    id: "holiday_camp",
    title: "Holiday Camp",
    duration: "Full day",
    price: "From $45/day",
    description: "School holiday training camps",
    badge: null,
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
          <p className="mt-3 text-slate-600">
            We&apos;ve sent a confirmation email to <strong>{form.parentEmail}</strong> with
            all the details. We&apos;ll be in touch to confirm the exact time.
          </p>
          <div className="mt-6 rounded-2xl bg-white p-5 text-left shadow-sm border">
            <p className="text-sm text-slate-500">Your booking</p>
            <p className="font-semibold mt-1">
              {SESSION_TYPES.find((s) => s.id === selectedSession)?.title}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              {form.playerName} &middot; {form.preferredDate} at {form.preferredTime}
            </p>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Remember to bring boots, shin pads, and a water bottle!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-6 py-10 text-center">
          <Badge className="mb-3 rounded-full px-4 py-1">Book a Session</Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Book your football coaching session
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Choose a session type, pick your time, and we&apos;ll take care of the rest.
          </p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="border-b bg-white">
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
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  step >= n
                    ? "bg-slate-900 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {step > n ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  n
                )}
              </div>
              <span
                className={
                  step >= n
                    ? "font-medium text-slate-900"
                    : "text-slate-400"
                }
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
            {SESSION_TYPES.map((s) => (
              <Card
                key={s.id}
                className={`cursor-pointer rounded-2xl transition-all hover:shadow-md ${
                  selectedSession === s.id
                    ? "ring-2 ring-slate-900"
                    : "hover:ring-1 hover:ring-slate-300"
                }`}
                onClick={() => setSelectedSession(s.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{s.title}</CardTitle>
                    {s.badge && (
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {s.badge}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{s.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {s.duration}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {s.price}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="sm:col-span-2 flex justify-end mt-2">
              <Button
                className="rounded-2xl px-8"
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
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Your Details</CardTitle>
                <CardDescription>
                  Tell us about yourself and your player.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Your name *</Label>
                    <Input
                      value={form.parentName}
                      onChange={(e) => update("parentName", e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={form.parentEmail}
                      onChange={(e) => update("parentEmail", e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Phone number</Label>
                  <Input
                    type="tel"
                    value={form.parentPhone}
                    onChange={(e) => update("parentPhone", e.target.value)}
                    placeholder="07xxx xxx xxx"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Player name *</Label>
                    <Input
                      value={form.playerName}
                      onChange={(e) => update("playerName", e.target.value)}
                      placeholder="Player's first name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Player age group</Label>
                    <Select
                      value={form.playerAge}
                      onValueChange={(v) => update("playerAge", v)}
                    >
                      <SelectTrigger>
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
                  <Label>Anything we should know?</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Position preference, injuries, experience level..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    className="rounded-2xl px-8"
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
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Pick a Time</CardTitle>
                <CardDescription>
                  Choose your preferred date and time slot.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Preferred date *</Label>
                  <Input
                    type="date"
                    value={form.preferredDate}
                    onChange={(e) => update("preferredDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Preferred time *</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        onClick={() => update("preferredTime", t)}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                          form.preferredTime === t
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Summary */}
                <div className="rounded-2xl bg-slate-50 p-5 mt-2">
                  <p className="text-sm font-medium text-slate-500 mb-3">
                    Booking Summary
                  </p>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-slate-400" />
                      <span>
                        {SESSION_TYPES.find((s) => s.id === selectedSession)
                          ?.title ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span>{form.playerName || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      <span>{form.preferredDate || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>{form.preferredTime || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>Location TBC after confirmation</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-2">
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    className="rounded-2xl px-8"
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
    </div>
  );
}
