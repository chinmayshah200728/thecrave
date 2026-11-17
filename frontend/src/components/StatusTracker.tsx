import { Bike, ChefHat, ClipboardCheck, House } from "lucide-react";
import { motion } from "motion/react";
import { STATUS_FLOW, STATUS_LABEL, type OrderStatus } from "@/lib/types";

const ICONS = { received: ClipboardCheck, preparing: ChefHat, out_for_delivery: Bike, delivered: House };

export default function StatusTracker({ status }: { status: OrderStatus }) {
  const current = STATUS_FLOW.indexOf(status);
  return (
    <div className="relative" aria-live="polite" data-testid="order-status-tracker">
      <div className="absolute left-5 right-5 top-5 h-px bg-[#e9b872]/15" />
      <motion.div
        className="absolute left-5 top-5 h-px origin-left bg-gradient-to-r from-[#c8664a] to-[#e9b872]"
        style={{ right: 20 }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: current / (STATUS_FLOW.length - 1) }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <ol className="relative grid grid-cols-4 gap-2">
        {STATUS_FLOW.map((s, i) => {
          const Icon = ICONS[s];
          const done = i <= current;
          const active = i === current;
          return (
            <li key={s} className="flex flex-col items-start" data-testid={`status-step-${s}`} data-done={done}>
              <span
                className={`relative grid size-10 place-items-center rounded-full border transition-colors duration-500 ${
                  done ? "border-[#c8664a] bg-[#c8664a] text-white" : "border-[#e9b872]/20 bg-[#17130f] text-[#c4b5a5]/60"
                }`}
              >
                {active && <span className="absolute inset-0 animate-ping rounded-full bg-[#c8664a]/40" />}
                <Icon className="relative size-4" />
              </span>
              <span className={`mt-3 text-xs sm:text-sm ${done ? "text-[#f6eee3]" : "text-[#c4b5a5]/60"}`}>{STATUS_LABEL[s]}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
