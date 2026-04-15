"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Dumbbell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions/auth";

type NavItem = { label: string; href: string; key: string };

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", key: "dashboard" },
  { label: "Generator", href: "/generator", key: "generator" },
  { label: "Hub", href: "/hub", key: "hub" },
];

type UserMeta = { full_name: string | null; email: string | null; role: string | null };

export function AppNav({ active }: { active?: string }) {
  const [user, setUser] = useState<UserMeta | null>(null);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;

    // Lazy-import to avoid bundling in pages that don't need it
    import("@/lib/supabase/client").then(({ createClient }) => {
      const sb = createClient();
      sb.auth.getUser().then(async ({ data }) => {
        if (!data.user) return;
        const { data: profile } = await sb
          .from("profiles")
          .select("full_name, role")
          .eq("id", data.user.id)
          .single();
        setUser({
          full_name: profile?.full_name ?? null,
          email: data.user.email ?? null,
          role: profile?.role ?? null,
        });
      });
    });
  }, []);

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          CoachPlatform
        </Link>

        {/* Nav links */}
        <nav className="hidden gap-1 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                active === item.key
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User + sign out */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right text-sm sm:block">
                <p className="font-medium leading-none">{user.full_name ?? user.email}</p>
                <p className="mt-0.5 text-xs capitalize text-slate-400">{user.role ?? "member"}</p>
              </div>
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="icon" className="rounded-xl" title="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <Button variant="outline" size="sm" className="rounded-xl" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
