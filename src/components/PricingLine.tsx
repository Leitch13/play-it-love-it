type PricingLineProps = {
  name: string;
  value: string;
};

export function PricingLine({ name, value }: PricingLineProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border p-3">
      <span className="font-medium">{name}</span>
      <span className="text-right text-slate-500">{value}</span>
    </div>
  );
}
