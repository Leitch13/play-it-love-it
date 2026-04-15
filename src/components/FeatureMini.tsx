import React from "react";

type FeatureMiniProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
};

export function FeatureMini({ icon: Icon, title, subtitle }: FeatureMiniProps) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-4">
      <Icon className="h-5 w-5" />
      <div className="mt-3 font-medium">{title}</div>
      <div className="text-sm text-slate-500">{subtitle}</div>
    </div>
  );
}
