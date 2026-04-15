"use client";

import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  currentTag?: string;
  currentQ?: string;
  tags: string[];
};

export function HubSearch({ currentTag, currentQ, tags }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    router.push(`${pathname}${sp.toString() ? `?${sp}` : ""}`);
  };

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="rounded-2xl pl-9"
          placeholder="Search sessions…"
          defaultValue={currentQ ?? ""}
          onChange={(e) =>
            navigate({ tag: currentTag, q: e.target.value || undefined })
          }
        />
      </div>

      {/* Tag filter chips */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!currentTag ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => navigate({ q: currentQ })}
          >
            All
          </Button>
          {tags.map((t) => (
            <Badge
              key={t}
              variant={currentTag === t ? "default" : "outline"}
              className="cursor-pointer rounded-full px-3 py-1 text-xs"
              onClick={() =>
                navigate({ tag: currentTag === t ? undefined : t, q: currentQ })
              }
            >
              {t}
            </Badge>
          ))}
          {currentTag && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 rounded-full text-xs"
              onClick={() => navigate({ q: currentQ })}
            >
              <X className="h-3 w-3" /> Clear filter
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
