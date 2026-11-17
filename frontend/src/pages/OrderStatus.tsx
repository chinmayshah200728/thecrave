import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import StatusTracker from "@/components/StatusTracker";
import ChefCanvas from "@/components/ChefCanvas";
import { apiGet } from "@/lib/api";
import { PAYMENT_LABEL, STATUS_LABEL, formatINR, type Order, type OrderStatus as Status } from "@/lib/types";

const HEADLINE: Record<Status, string> = {
  received: "We've got your order.",
  preparing: "Your pans are hot.",
  out_for_delivery: "On its way to you.",
  delivered: "Delivered. Enjoy!",
};

export default function OrderStatus() {
  const { id = "" } = useParams();
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => apiGet<Order>(`/orders/${id}`),
    refetchInterval: (q) => (q.state.data?.status === "delivered" ? false : 5000),
    retry: 1,
  });
  const live = order && !isError;

  return (
    <div className="min-h-screen bg-[#17130f] text-[#f6eee3]">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1200px] gap-12 px-5 pb-24 pt-28 sm:px-8 lg:grid-cols-[1fr_340px] lg:pt-36">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#c4b5a5] transition-colors duration-200 hover:text-[#e9b872]"
            data-testid="order-back-home-link"
          >
            <ArrowLeft className="size-3.5" /> Back to the kitchen
          </Link>

          {isLoading && <div className="mt-10 h-48 animate-pulse rounded-3xl bg-[#211a14]" data-testid="order-loading" />}

          {!isLoading && !live && (
            <div className="mt-10" data-testid="order-not-found">
              <h1 className="font-heading text-5xl">We can't find that order.</h1>
              <p className="mt-4 text-[#c4b5a5]">Check the link, or head back and place a fresh one.</p>
            </div>
          )}

          {live && (
            <>
              <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.28em] text-[#e9b872]" data-testid="order-number">
                Order {order.order_number} · {STATUS_LABEL[order.status]}
              </p>
              <h1 className="mt-4 font-heading text-[clamp(2.6rem,6vw,4.75rem)] leading-[0.95] tracking-[-0.02em]" data-testid="order-headline">
                {HEADLINE[order.status]}
                <span className="block italic text-[#e9b872]">Thank you, {order.customer_name.split(" ")[0]}.</span>
              </h1>

              <div className="mt-12 rounded-3xl border border-[#e9b872]/15 bg-[#211a14] p-6 sm:p-8">
                <StatusTracker status={order.status} />
                <p className="mt-8 text-sm text-[#c4b5a5]">
                  This page updates on its own as the kitchen moves your order along. Placed {format(new Date(order.created_at), "d MMM, h:mm a")}.
                </p>
              </div>

              <div className="mt-8 grid gap-8 rounded-3xl border border-[#e9b872]/15 bg-[#1b1611] p-6 sm:grid-cols-2 sm:p-8">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#e9b872]">Your order</p>
                  <ul className="mt-4 space-y-2 text-sm" data-testid="order-items">
                    {order.items.map((it) => (
                      <li key={it.item_id} className="flex justify-between gap-4">
                        <span className="text-[#f6eee3]">{it.qty} × {it.name}</span>
                        <span className="font-mono text-[#c4b5a5]">{formatINR(it.price * it.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 space-y-1 border-t border-[#e9b872]/10 pt-4 text-sm text-[#c4b5a5]">
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>{order.delivery_fee === 0 ? "Free" : formatINR(order.delivery_fee)}</span>
                    </div>
                    <div className="flex justify-between font-heading text-xl text-[#f6eee3]">
                      <span>Total</span>
                      <span data-testid="order-total">{formatINR(order.total)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#e9b872]">Delivering to</p>
                  <p className="mt-4 text-[#f6eee3]">{order.customer_name}</p>
                  <p className="text-[#c4b5a5]">{order.phone}</p>
                  <p className="mt-2 whitespace-pre-line text-[#c4b5a5]">{order.address}</p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#e9b872]">Payment</p>
                  <p className="mt-2 text-[#f6eee3]" data-testid="order-payment">
                    {PAYMENT_LABEL[order.payment_method]} · {formatINR(order.total)}
                  </p>
                  {order.note && <p className="mt-3 italic text-[#c4b5a5]">“{order.note}”</p>}
                </div>
              </div>
            </>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28 overflow-hidden rounded-[28px] border border-[#e9b872]/15 bg-[radial-gradient(70%_60%_at_50%_40%,rgba(200,102,74,0.22),transparent_70%),#1b1611]">
            <ChefCanvas mood={order?.status === "delivered" ? "wave" : "cheer"} className="h-[420px] w-full" />
            <p className="px-6 pb-6 text-center font-heading text-lg italic text-[#e9b872]">
              {order?.status === "preparing" ? "Cooking it with love…" : "Chef Crave is on it!"}
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
