import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, ChefHat, Loader2, LogOut, Lock, Phone } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import {
  PAYMENT_LABEL,
  STATUS_FLOW,
  STATUS_LABEL,
  formatINR,
  type KitchenSession,
  type Order,
  type OrderStatus,
  type PinLogin,
  type StatusUpdate,
} from "@/lib/types";

const NEXT_ACTION: Partial<Record<OrderStatus, string>> = {
  received: "Start cooking",
  preparing: "Send out for delivery",
  out_for_delivery: "Mark delivered",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  received: "bg-[#e9b872]/15 text-[#e9b872] border-[#e9b872]/30",
  preparing: "bg-[#c8664a]/15 text-[#f0a089] border-[#c8664a]/40",
  out_for_delivery: "bg-[#3f6844]/25 text-[#9fd3a4] border-[#3f6844]/60",
  delivered: "bg-[#f6eee3]/5 text-[#c4b5a5] border-[#f6eee3]/10",
};

type Filter = "all" | OrderStatus;

function PinGate() {
  const qc = useQueryClient();
  const [pin, setPin] = useState("");
  const login = useMutation({
    mutationFn: (body: PinLogin) => apiPost<KitchenSession>("/kitchen/login", body),
    onSuccess: () => {
      toast.success("Welcome to the kitchen");
      qc.invalidateQueries({ queryKey: ["kitchen"] });
    },
    onError: () => {
      setPin("");
      toast.error("Wrong PIN");
    },
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (pin) login.mutate({ pin });
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-24 max-w-sm rounded-3xl border border-[#e9b872]/15 bg-[#211a14] p-8" data-testid="kitchen-pin-form">
      <Lock className="size-6 text-[#e9b872]" />
      <h1 className="mt-5 font-heading text-4xl">Staff only.</h1>
      <p className="mt-2 text-sm text-[#c4b5a5]">Enter the kitchen PIN to see incoming orders.</p>
      <Input
        type="password"
        inputMode="numeric"
        autoFocus
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="••••"
        className="mt-6 h-14 border-[#e9b872]/25 bg-[#17130f] text-center font-mono text-2xl tracking-[0.6em] text-[#f6eee3]"
        data-testid="kitchen-pin-input"
      />
      <button
        type="submit"
        disabled={login.isPending || !pin}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#c8664a] py-3.5 text-sm font-medium text-white transition-[background-color,opacity] duration-200 hover:bg-[#d9775c] disabled:opacity-50"
        data-testid="kitchen-pin-submit"
      >
        {login.isPending && <Loader2 className="size-4 animate-spin" />} Unlock kitchen
      </button>
    </form>
  );
}

function OrderCard({ order }: { order: Order }) {
  const qc = useQueryClient();
  const update = useMutation({
    mutationFn: (body: StatusUpdate) => apiPatch<Order>(`/kitchen/orders/${order.id}/status`, body),
    onSuccess: (o) => {
      toast.success(`${o.order_number} → ${STATUS_LABEL[o.status]}`);
      qc.invalidateQueries({ queryKey: ["kitchen", "orders"] });
    },
    onError: () => toast.error("Couldn't update the order"),
  });
  const idx = STATUS_FLOW.indexOf(order.status);
  const next = STATUS_FLOW[idx + 1];
  const action = NEXT_ACTION[order.status];

  return (
    <article className="flex flex-col rounded-3xl border border-[#e9b872]/12 bg-[#211a14] p-5" data-testid={`kitchen-order-${order.order_number}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-[#f6eee3]">{order.order_number}</p>
          <p className="mt-0.5 text-xs text-[#c4b5a5]">{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] ${STATUS_STYLE[order.status]}`}
          data-testid={`kitchen-order-status-${order.order_number}`}
        >
          {STATUS_LABEL[order.status]}
        </span>
      </div>
      <ul className="mt-4 space-y-1.5 border-y border-[#e9b872]/10 py-4 text-sm">
        {order.items.map((it) => (
          <li key={it.item_id} className="flex gap-2">
            <span className="w-6 font-mono text-[#e9b872]">{it.qty}×</span>
            <span className="text-[#f6eee3]">{it.name}</span>
          </li>
        ))}
      </ul>
      {order.note && <p className="mt-3 rounded-xl bg-[#c8664a]/10 px-3 py-2 text-sm italic text-[#f0a089]">“{order.note}”</p>}
      <div className="mt-4 flex-1 space-y-1 text-sm text-[#c4b5a5]">
        <p className="text-[#f6eee3]">{order.customer_name}</p>
        <p className="flex items-center gap-1.5">
          <Phone className="size-3" /> {order.phone}
        </p>
        <p className="line-clamp-2">{order.address}</p>
        <p className="pt-1 font-mono text-xs text-[#e9b872]">
          {PAYMENT_LABEL[order.payment_method]} · {formatINR(order.total)}
        </p>
      </div>
      {next && action ? (
        <button
          type="button"
          disabled={update.isPending}
          onClick={() => update.mutate({ status: next })}
          className="group mt-5 flex items-center justify-center gap-2 rounded-full bg-[#c8664a] py-3 text-sm font-medium text-white transition-[background-color,opacity] duration-200 hover:bg-[#d9775c] disabled:opacity-60"
          data-testid={`kitchen-advance-${order.order_number}`}
        >
          {update.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {action} <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      ) : (
        <p className="mt-5 py-3 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-[#c4b5a5]/60">Completed</p>
      )}
    </article>
  );
}

function Board() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ["kitchen", "orders"],
    queryFn: () => apiGet<Order[]>("/kitchen/orders"),
    refetchInterval: 5000,
  });
  const logout = useMutation({
    mutationFn: () => apiPost<KitchenSession>("/kitchen/logout"),
    onSettled: () => {
      qc.removeQueries({ queryKey: ["kitchen"] });
      qc.invalidateQueries({ queryKey: ["kitchen"] });
    },
  });

  const counts = Object.fromEntries(STATUS_FLOW.map((s) => [s, orders.filter((o) => o.status === s).length])) as Record<OrderStatus, number>;
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const filters: Filter[] = ["all", ...STATUS_FLOW];

  return (
    <div className="pt-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#e9b872]">Kitchen display · live</p>
          <h1 className="mt-3 font-heading text-5xl">The pass.</h1>
        </div>
        <button
          type="button"
          onClick={() => logout.mutate()}
          className="inline-flex items-center gap-2 rounded-full border border-[#e9b872]/25 px-4 py-2 text-sm text-[#c4b5a5] transition-colors duration-200 hover:border-[#e9b872]/60 hover:text-[#f6eee3]"
          data-testid="kitchen-logout-btn"
        >
          <LogOut className="size-4" /> Lock
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STATUS_FLOW.map((s) => (
          <div key={s} className="rounded-2xl border border-[#e9b872]/12 bg-[#211a14] p-4" data-testid={`kitchen-count-${s}`}>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c4b5a5]">{STATUS_LABEL[s]}</p>
            <p className="mt-2 font-heading text-3xl">{counts[s]}</p>
          </div>
        ))}
        <div className="col-span-2 rounded-2xl border border-[#c8664a]/30 bg-[#c8664a]/10 p-4 sm:col-span-1" data-testid="kitchen-revenue">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f0a089]">Order value</p>
          <p className="mt-2 font-heading text-3xl">{formatINR(revenue)}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors duration-200 ${
              filter === f ? "border-[#e9b872] bg-[#e9b872] text-[#17130f]" : "border-[#e9b872]/20 text-[#c4b5a5] hover:border-[#e9b872]/50"
            }`}
            data-testid={`kitchen-filter-${f}`}
          >
            {f === "all" ? `All (${orders.length})` : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-3xl bg-[#211a14]" />
          ))}
        </div>
      ) : isError ? (
        <p className="mt-10 text-[#c4b5a5]" data-testid="kitchen-orders-error">Couldn't load orders. Retrying…</p>
      ) : shown.length === 0 ? (
        <p className="mt-16 text-center font-heading text-2xl italic text-[#c4b5a5]" data-testid="kitchen-empty-state">
          Quiet on the pass. No orders here yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3" data-testid="kitchen-orders-grid">
          {shown.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Kitchen() {
  const { data, isLoading } = useQuery({
    queryKey: ["kitchen", "me"],
    queryFn: () => apiGet<KitchenSession>("/kitchen/me"),
  });

  return (
    <div className="min-h-screen bg-[#17130f] text-[#f6eee3]">
      <header className="border-b border-[#e9b872]/10 bg-[#120f0d]">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5" data-testid="kitchen-brand-link">
            <ChefHat className="size-5 text-[#e9b872]" strokeWidth={1.6} />
            <span className="font-mono text-xs uppercase tracking-[0.25em]">The Fresh Crave</span>
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#c4b5a5]/60">Kitchen control room</span>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-5 pb-24 sm:px-8">
        {isLoading ? null : data?.authed ? <Board /> : <PinGate />}
      </main>
    </div>
  );
}
