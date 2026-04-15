"use client";

import { useMemo, useState } from "react";
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
import { AppNav } from "@/components/AppNav";
import { SavePlanButton } from "@/components/SavePlanButton";
import { buildPlan, type GoalType, type Level, type PlanInput, type Position } from "@/lib/planGenerator";

export default function GeneratorPage() {
  const [planInput, setPlanInput] = useState<PlanInput>({
    playerName: "",
    age: 12,
    position: "midfielder",
    level: "intermediate",
    availableDays: 3,
    trainingGoal: "ball mastery",
    notes: "",
  });

  const generatedPlan = useMemo(() => buildPlan(planInput), [planInput]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav active="generator" />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Weekly Plan Generator</h1>
          <p className="mt-1 text-slate-500">
            Build a personalised plan in seconds — the core engine for your coaching business.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input form */}
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Build a weekly plan</CardTitle>
              <CardDescription>
                This is the core low-ticket and high-ticket engine for your coaching business.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Player name</Label>
                <Input
                  value={planInput.playerName}
                  onChange={(e) => setPlanInput((s) => ({ ...s, playerName: e.target.value }))}
                  placeholder="Mason"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    min={6}
                    max={18}
                    value={planInput.age}
                    onChange={(e) =>
                      setPlanInput((s) => ({ ...s, age: Number(e.target.value || 12) }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Days available</Label>
                  <Input
                    type="number"
                    min={2}
                    max={5}
                    value={planInput.availableDays}
                    onChange={(e) =>
                      setPlanInput((s) => ({ ...s, availableDays: Number(e.target.value || 3) }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Position</Label>
                  <Select
                    value={planInput.position}
                    onValueChange={(v: Position) => setPlanInput((s) => ({ ...s, position: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                      <SelectItem value="defender">Defender</SelectItem>
                      <SelectItem value="midfielder">Midfielder</SelectItem>
                      <SelectItem value="forward">Forward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Level</Label>
                  <Select
                    value={planInput.level}
                    onValueChange={(v: Level) => setPlanInput((s) => ({ ...s, level: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Primary goal</Label>
                <Select
                  value={planInput.trainingGoal}
                  onValueChange={(v: GoalType) =>
                    setPlanInput((s) => ({ ...s, trainingGoal: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ball mastery">Ball Mastery</SelectItem>
                    <SelectItem value="speed">Speed</SelectItem>
                    <SelectItem value="finishing">Finishing</SelectItem>
                    <SelectItem value="confidence">Confidence</SelectItem>
                    <SelectItem value="match fitness">Match Fitness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Coach notes</Label>
                <Textarea
                  value={planInput.notes}
                  onChange={(e) => setPlanInput((s) => ({ ...s, notes: e.target.value }))}
                  placeholder="Add context like weak foot, confidence, or recent match issues"
                />
              </div>
            </CardContent>
          </Card>

          {/* Generated plan */}
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>{generatedPlan.title}</CardTitle>
              <CardDescription>{generatedPlan.weeklyFocus}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
                <strong>Coach note:</strong> {generatedPlan.coachNote}
              </div>

              {generatedPlan.sessions.map((session) => (
                <div key={session.day} className="rounded-2xl border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold">{session.day}</h4>
                      <p className="text-sm text-slate-500">{session.focus}</p>
                    </div>
                    <Badge variant="secondary">{session.duration}</Badge>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-slate-700">
                    {session.drills.map((drill) => (
                      <li key={drill}>• {drill}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-slate-500">Recovery: {session.recovery}</p>
                </div>
              ))}

              <SavePlanButton plan={generatedPlan} input={planInput} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
