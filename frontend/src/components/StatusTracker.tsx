import { Bike, ChefHat, ClipboardCheck, House } from "lucide-react";
import { motion } from "motion/react";
import { STATUS_FLOW, STATUS_LABEL, type OrderStatus } from "@/lib/types";

const ICONS = { received: ClipboardCheck, preparing: ChefHat, out_for_delivery: Bike, delivered: House };

const STEP_SHORT_LABEL: Record<OrderStatus, string> = {
  received: "Received",
  preparing: "Preparing",
  out_for_delivery: "On the way",
  delivered: "Delivered",
};

export default function StatusTracker({ status }: { status: OrderStatus }) {
  const current = STATUS_FLOW.indexOf(status);
  return (
    <div className="relative" aria-live="polite" data-testid="order-status-tracker">
      <div className="absolute left-4 right-4 sm:left-5 sm:right-5 top-4 sm:top-5 h-px bg-[#e9b872]/15" />
      <motion.div
        className="absolute left-4 right-4 sm:left-5 sm:right-5 top-4 sm:top-5 h-px origin-left bg-gradient-to-r from-[#c8664a] to-[#e9b872]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: current / (STATUS_FLOW.length - 1) }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <ol className="relative grid grid-cols-4 gap-1.5 sm:gap-2">
        {STATUS_FLOW.map((s, i) => {
          const Icon = ICONS[s];
          const done = i <= current;
          const active = i === current;
          return (
            <li key={s} className="flex flex-col items-center sm:items-start text-center sm:text-left" data-testid={`status-step-${s}`} data-done={done}>
              <span
                className={`relative grid size-8 sm:size-10 place-items-center rounded-full border transition-colors duration-500 ${
                  done ? "border-[#c8664a] bg-[#c8664a] text-white" : "border-[#e9b872]/20 bg-[#17130f] text-[#c4b5a5]/60"
                }`}
              >
                {active && <span className="absolute inset-0 animate-ping rounded-full bg-[#c8664a]/40" />}
                <Icon className="relative size-3.5 sm:size-4" />
              </span>
              <span className={`mt-2 sm:mt-3 text-[10px] sm:text-xs leading-tight sm:leading-normal ${done ? "text-[#f6eee3] font-medium" : "text-[#c4b5a5]/60"}`}>
                <span className="sm:hidden">{STEP_SHORT_LABEL[s]}</span>
                <span className="hidden sm:inline">{STATUS_LABEL[s]}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
