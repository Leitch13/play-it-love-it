type DashboardRowProps = {
  title: string;
  body: string;
};

export function DashboardRow({ title, body }: DashboardRowProps) {
  return (
    <div className="rounded-2xl border p-4">
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
    </div>
  );
}
