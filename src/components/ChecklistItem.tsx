type ChecklistItemProps = {
  done?: boolean;
  label: string;
};

export function ChecklistItem({ done = false, label }: ChecklistItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`h-3 w-3 rounded-full ${done ? "bg-slate-900" : "bg-slate-300"}`}
      />
      <span>{label}</span>
    </div>
  );
}
