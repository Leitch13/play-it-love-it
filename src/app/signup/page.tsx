"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { signUp } from "@/app/actions/auth";

const initialState = { error: null };

export default function SignupPage() {
  const [state, action, pending] = useActionState(signUp, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900">
            <Dumbbell className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold">CoachPlatform</h1>
        </div>

        <Card className="rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Join as a coach, parent, or player</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={action} className="grid gap-4">
              {state?.error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {state.error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" name="fullName" placeholder="John Smith" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">I am a…</Label>
                <Select name="role" defaultValue="player">
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coach">Coach</SelectItem>
                    <SelectItem value="parent">Parent / Guardian</SelectItem>
                    <SelectItem value="player">Player</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="rounded-2xl" disabled={pending}>
                {pending ? "Creating account…" : "Create account"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-slate-900 underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
