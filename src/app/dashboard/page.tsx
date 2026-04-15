import Link from "next/link";
import {
  CalendarDays,
  LayoutDashboard,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AppNav } from "@/components/AppNav";
import { StatCard } from "@/components/StatCard";
import { DashboardRow } from "@/components/DashboardRow";
import { ChecklistItem } from "@/components/ChecklistItem";

export const metadata = {
  title: "Dashboard – Coaching Platform",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav active="dashboard" />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Coach Dashboard</h1>
          <p className="mt-1 text-slate-500">Your weekly overview at a glance.</p>
        </div>

        {/* Stats row */}
        <div className="grid gap-6 lg:grid-cols-4">
          <StatCard icon={Users} title="Active Players" value="48" subtitle="Across 4 programs" />
          <StatCard icon={CalendarDays} title="Sessions This Week" value="12" subtitle="3 today" />
          <StatCard icon={Mail} title="Parent Updates" value="18" subtitle="Ready to send" />
          <StatCard icon={ShieldCheck} title="Paid Members" value="27" subtitle="Training hub access" />
        </div>

        {/* Main content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="rounded-3xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Coach dashboard shell
              </CardTitle>
              <CardDescription>
                This becomes the shared base for your business and the Play It Love It tools.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <DashboardRow
                title="Today's priority"
                body="Review 5 player progress notes, publish 1 new hub session, and send this week's parent summary."
              />
              <DashboardRow
                title="Revenue task"
                body="Drive funnel traffic to the free guide and move new leads into a welcome email sequence."
              />
              <DashboardRow
                title="Delivery task"
                body="Use the plan generator to create 3 custom player plans and upload them to the training hub."
              />
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Launch progress</CardTitle>
              <CardDescription>Simple visual tracker for your first version.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Progress value={62} />
              <ChecklistItem done label="Landing page and lead magnet" />
              <ChecklistItem done label="Dashboard shell" />
              <ChecklistItem done label="Plan generator MVP" />
              <ChecklistItem label="Training hub auth + payments" />
              <ChecklistItem label="Parent comms module" />
            </CardContent>
          </Card>
        </div>

        {/* Quick links */}
        <div className="mt-6 flex gap-3">
          <Button className="rounded-2xl" asChild>
            <Link href="/generator">Open Plan Generator</Link>
          </Button>
          <Button variant="outline" className="rounded-2xl" asChild>
            <Link href="/hub">Training Hub</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
