import { Minus, Plus } from "lucide-react";

interface Props {
  qty: number;
  onChange: (qty: number) => void;
  testId: string;
}

export default function QtyStepper({ qty, onChange, testId }: Props) {
  const btn =
    "grid size-8 place-items-center rounded-full text-[#f6eee3] transition-[background-color,transform] duration-150 hover:bg-[#e9b872]/15 active:scale-90";
  return (
    <div className="flex items-center gap-1 rounded-full border border-[#e9b872]/25 bg-[#17130f] p-0.5">
      <button type="button" className={btn} onClick={() => onChange(qty - 1)} aria-label="Decrease" data-testid={`${testId}-decrease`}>
        <Minus className="size-3.5" />
      </button>
      <span className="w-6 text-center font-mono text-sm text-[#f6eee3]" data-testid={`${testId}-qty`}>
        {qty}
      </span>
      <button type="button" className={btn} onClick={() => onChange(qty + 1)} aria-label="Increase" data-testid={`${testId}-increase`}>
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
