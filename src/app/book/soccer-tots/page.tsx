"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Shield,
  Heart,
  Star,
  Smile,
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
    id: "mini_ballers",
    title: "Mini Ballers",
    ageRange: "18 months \u2013 3 years",
    duration: "60 min",
    description: "First steps into football \u2014 fun, movement and coordination",
    icon: Heart,
    sessions: [
      { day: "Tuesday", time: "11:30am \u2013 12:30pm", location: "Ellon Meadows Sports Centre" },
      { day: "Saturday", time: "9:00am \u2013 10:00am", location: "Braehead School" },
      { day: "Friday", time: "11:15am \u2013 12:15pm", location: "Westdyke Leisure Centre" },
    ],
  },
  {
    id: "little_ballers",
    title: "Little Ballers",
    ageRange: "3 \u2013 5 years",
    duration: "60 min",
    description: "Building confidence, balance and basic ball skills",
    icon: Star,
    sessions: [
      { day: "Saturday", time: "10:00am \u2013 11:00am", location: "Braehead School" },
      { day: "Friday", time: "12:15pm \u2013 1:15pm", location: "Westdyke Leisure Centre" },
      { day: "Friday", time: "1:15pm \u2013 2:15pm", location: "Westdyke Leisure Centre" },
    ],
  },
  {
    id: "buzzing_ballers",
    title: "Buzzing Ballers",
    ageRange: "5 \u2013 7 years",
    duration: "60 min",
    description: "Developing skills, teamwork and a love for the game",
    icon: Smile,
    sessions: [
      { day: "Saturday", time: "11:00am \u2013 12:00pm", location: "Braehead School" },
    ],
  },
];

export default function SoccerTotsBookingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [form, setForm] = useState({
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    playerName: "",
    playerAge: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const selectedType = SESSION_TYPES.find((s) => s.id === selectedSession);

  const handleSubmit = async () => {
    if (!selectedSession || !selectedSlot) return;
    setSubmitting(true);
    setError(null);

    const slot = selectedType?.sessions[parseInt(selectedSlot)];

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: form.parentName,
          parentEmail: form.parentEmail,
          parentPhone: form.parentPhone,
          playerName: form.playerName,
          playerAge: form.playerAge || selectedType?.ageRange,
          sessionType: `soccer_tots_${selectedSession}`,
          preferredDate: slot?.day ?? "",
          preferredTime: slot?.time ?? "",
          notes: `${slot?.location ?? ""} | ${form.notes}`,
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

  if (submitted) {
    const slot = selectedType?.sessions[parseInt(selectedSlot ?? "0")];
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-500 to-orange-500 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Trial Booked!</h1>
          <p className="mt-3 text-amber-100">
            We&apos;ve sent a confirmation to <strong className="text-white">{form.parentEmail}</strong>.
            We can&apos;t wait to meet {form.playerName}!
          </p>
          <div className="mt-6 rounded-2xl bg-white/10 backdrop-blur-sm p-5 text-left border border-white/20">
            <p className="text-sm text-amber-200">Your trial session</p>
            <p className="font-semibold mt-1 text-white text-lg">{selectedType?.title}</p>
            <p className="text-sm text-amber-100 mt-1">
              {slot?.day} &middot; {slot?.time}
            </p>
            <p className="text-sm text-amber-100 mt-0.5">
              {slot?.location}
            </p>
          </div>
          <div className="mt-6 rounded-2xl bg-white/10 border border-white/20 p-4">
            <p className="text-sm text-amber-100">
              <strong>What to bring:</strong> Trainers, comfortable clothes, a water bottle, and lots of energy!
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-500 via-orange-500 to-orange-600">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-400/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl px-6 pt-12 pb-8 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Play It Love It</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Badge className="mb-4 rounded-full bg-white/20 text-white border-white/30 px-4 py-1.5 text-sm">
              Free Trial Available
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Soccer Tots
            </h1>
            <p className="mt-2 text-xl text-amber-100 font-medium">
              Football fun for little ones aged 18 months to 7 years
            </p>
            <p className="mt-3 text-amber-200/80 max-w-xl mx-auto">
              Build confidence, coordination, and a love for the game in a fun, safe environment. No experience needed!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-amber-100/80"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-white" /> Qualified Coaches
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-white" /> Free Trial Session
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-white" /> No Commitment
            </span>
          </motion.div>
        </div>
      </div>

      {/* Steps */}
      <div className="border-y border-white/10 bg-white/10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-8 px-6 py-4">
          {[
            { n: 1, label: "Choose Class" },
            { n: 2, label: "Your Details" },
            { n: 3, label: "Pick a Session" },
          ].map(({ n, label }) => (
            <button
              key={n}
              onClick={() => {
                if (n === 1) setStep(1);
                if (n === 2 && selectedSession) setStep(2);
                if (n === 3 && form.parentName && form.parentEmail && form.playerName) setStep(3);
              }}
              className="flex items-center gap-2 text-sm"
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                step >= n ? "bg-white text-orange-600 shadow-lg" : "bg-white/20 text-white/50"
              }`}>
                {step > n ? <CheckCircle2 className="h-4 w-4" /> : n}
              </div>
              <span className={`hidden sm:inline ${step >= n ? "font-medium text-white" : "text-white/50"}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {/* Step 1 */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4">
            {SESSION_TYPES.map((s) => {
              const Icon = s.icon;
              return (
                <Card
                  key={s.id}
                  className={`cursor-pointer rounded-2xl border-white/10 bg-white/10 backdrop-blur-sm transition-all hover:bg-white/15 ${
                    selectedSession === s.id ? "ring-2 ring-white bg-white/20" : "hover:ring-1 hover:ring-white/30"
                  }`}
                  onClick={() => { setSelectedSession(s.id); setSelectedSlot(null); }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        selectedSession === s.id ? "bg-white/30" : "bg-white/10"
                      }`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white">{s.title}</CardTitle>
                        <p className="text-sm font-medium text-amber-200">{s.ageRange}</p>
                      </div>
                    </div>
                    <CardDescription className="text-white/60 ml-[52px]">{s.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="ml-[52px] space-y-1">
                      {s.sessions.map((sess, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-white/50">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>{sess.day} {sess.time}</span>
                          <span className="text-white/30">&middot;</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{sess.location}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            <div className="flex justify-end mt-2">
              <Button
                className="rounded-2xl px-8 bg-white text-orange-600 hover:bg-white/90 font-semibold shadow-lg"
                disabled={!selectedSession}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="rounded-2xl border-white/10 bg-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Your Details</CardTitle>
                <CardDescription className="text-white/50">Tell us about you and your little one.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label className="text-white/70">Your name *</Label>
                    <Input value={form.parentName} onChange={(e) => update("parentName", e.target.value)} placeholder="Your full name" className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-white focus:ring-white/20" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-white/70">Email *</Label>
                    <Input type="email" value={form.parentEmail} onChange={(e) => update("parentEmail", e.target.value)} placeholder="your@email.com" className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-white focus:ring-white/20" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-white/70">Phone number</Label>
                  <Input type="tel" value={form.parentPhone} onChange={(e) => update("parentPhone", e.target.value)} placeholder="07xxx xxx xxx" className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-white focus:ring-white/20" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label className="text-white/70">Child&apos;s name *</Label>
                    <Input value={form.playerName} onChange={(e) => update("playerName", e.target.value)} placeholder="First name" className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-white focus:ring-white/20" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-white/70">Child&apos;s age</Label>
                    <Select value={form.playerAge} onValueChange={(v) => update("playerAge", v)}>
                      <SelectTrigger className="bg-white/10 border-white/10 text-white"><SelectValue placeholder="Select age" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="18m-2">18 months \u2013 2 years</SelectItem>
                        <SelectItem value="2-3">2 \u2013 3 years</SelectItem>
                        <SelectItem value="3-4">3 \u2013 4 years</SelectItem>
                        <SelectItem value="4-5">4 \u2013 5 years</SelectItem>
                        <SelectItem value="5-6">5 \u2013 6 years</SelectItem>
                        <SelectItem value="6-7">6 \u2013 7 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-white/70">Anything we should know?</Label>
                  <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Any additional needs, allergies, etc..." rows={3} className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-white focus:ring-white/20" />
                </div>
                <div className="flex justify-between mt-2">
                  <Button variant="outline" className="rounded-2xl border-white/20 text-white hover:bg-white/10" onClick={() => setStep(1)}>Back</Button>
                  <Button className="rounded-2xl px-8 bg-white text-orange-600 hover:bg-white/90 font-semibold shadow-lg" disabled={!form.parentName || !form.parentEmail || !form.playerName} onClick={() => setStep(3)}>Continue</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3 */}
        {step === 3 && selectedType && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="rounded-2xl border-white/10 bg-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Pick Your Session</CardTitle>
                <CardDescription className="text-white/50">
                  Choose which {selectedType.title} session works best for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {selectedType.sessions.map((sess, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSlot(String(i))}
                    className={`w-full rounded-xl border p-4 text-left transition-all ${
                      selectedSlot === String(i)
                        ? "border-white bg-white/20 ring-2 ring-white"
                        : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{sess.day}</p>
                        <p className="text-sm text-amber-200">{sess.time}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-white/50">
                        <MapPin className="h-3.5 w-3.5" />
                        {sess.location}
                      </div>
                    </div>
                  </button>
                ))}

                {error && (
                  <div className="rounded-xl bg-red-500/20 border border-red-400/30 px-4 py-3 text-sm text-red-200">{error}</div>
                )}

                {/* Summary */}
                {selectedSlot && (
                  <div className="rounded-2xl bg-white/10 border border-white/20 p-5 mt-2">
                    <p className="text-sm font-medium text-amber-200 mb-3">Trial Booking Summary</p>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2 text-white/70">
                        <Star className="h-4 w-4 text-amber-300" />
                        <span>{selectedType.title} ({selectedType.ageRange})</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <Users className="h-4 w-4 text-amber-300" />
                        <span>{form.playerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <CalendarDays className="h-4 w-4 text-amber-300" />
                        <span>{selectedType.sessions[parseInt(selectedSlot)].day} &middot; {selectedType.sessions[parseInt(selectedSlot)].time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <MapPin className="h-4 w-4 text-amber-300" />
                        <span>{selectedType.sessions[parseInt(selectedSlot)].location}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-2">
                  <Button variant="outline" className="rounded-2xl border-white/20 text-white hover:bg-white/10" onClick={() => setStep(2)}>Back</Button>
                  <Button
                    className="rounded-2xl px-8 bg-white text-orange-600 hover:bg-white/90 font-semibold shadow-lg"
                    disabled={!selectedSlot || submitting}
                    onClick={handleSubmit}
                  >
                    {submitting ? "Booking..." : "Book Free Trial"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      <div className="border-t border-white/10 mt-8">
        <div className="mx-auto max-w-3xl px-6 py-8 text-center">
          <p className="text-sm text-white/40">Play It Love It &middot; Football Fun for Little Ones</p>
        </div>
      </div>
    </div>
  );
}
