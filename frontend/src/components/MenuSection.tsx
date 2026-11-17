import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Bike, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { DISHES, type Category } from "@/data/dishes";
import { useCart } from "@/lib/cart";
import { FREE_DELIVERY_OVER, formatINR } from "@/lib/types";
import QtyStepper from "@/components/QtyStepper";

type MenuTab = "Sides & Sips" | "Signature" | "All";

const TABS: { id: MenuTab; label: string; count: number }[] = [
  { id: "Sides & Sips", label: "Sides & Sips", count: DISHES.filter((d) => d.category === "Sides & Sips").length },
  { id: "Signature", label: "Signatures", count: DISHES.filter((d) => d.category === "Signature").length },
  { id: "All", label: "Full Menu", count: DISHES.length },
];

export default function MenuSection() {
  const { lines, add, setQty, count, subtotal, setCartOpen } = useCart();
  const [activeTab, setActiveTab] = useState<MenuTab>("Sides & Sips");

  // If the user explicitly clicks "Skip to the menu" / "#menu", show the Full Menu immediately
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#menu") {
        setActiveTab("All");
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const visibleGroups: Category[] =
    activeTab === "All" ? ["Sides & Sips", "Signature"] : [activeTab];

  return (
    <section id="menu" data-stage={7} className="relative bg-[#17130f] pb-28 pt-16 sm:pt-24 lg:pt-32" data-testid="menu-section">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-[280px_1fr] lg:px-10">
        {/* left rail: Chef Crave lands here on desktop, cart summary below him */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="h-[310px]" aria-hidden />
            <div className="rounded-3xl border border-[#e9b872]/15 bg-[#211a14] p-5" data-testid="menu-cart-summary">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#e9b872]">Your order</p>
              <p className="mt-3 font-heading text-3xl text-[#f6eee3]" data-testid="menu-cart-subtotal">
                {formatINR(subtotal)}
              </p>
              <p className="mt-1 text-sm text-[#c4b5a5]">
                {count} {count === 1 ? "item" : "items"}
              </p>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                disabled={count === 0}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#c8664a] px-5 py-3 text-sm font-medium text-white transition-[background-color,opacity] duration-200 hover:bg-[#d9775c] disabled:opacity-40"
                data-testid="menu-view-cart-btn"
              >
                <ShoppingBag className="size-4" /> View cart
              </button>
              <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-[#c4b5a5]">
                <Bike className="mt-0.5 size-3.5 shrink-0 text-[#e9b872]" />
                Free delivery over {formatINR(FREE_DELIVERY_OVER)}. Pay by cash or UPI at your door.
              </p>
            </div>
          </div>
        </aside>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
          >
            <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.24em] sm:tracking-[0.28em] text-[#e9b872]">
              The order pass · delivering across Mumbai
            </p>
            <h2 className="mt-4 sm:mt-5 font-heading text-[clamp(2.2rem,6vw,5rem)] leading-[0.95] tracking-[-0.02em] text-[#f6eee3]">
              Now, <span className="italic text-[#e9b872]">bring it home.</span>
            </h2>
            <p className="mt-4 sm:mt-5 max-w-lg text-sm sm:text-base text-[#d4c7b8]">
              Pair your cravings with our house sides and sips — or browse the full menu below. Cooked to order and delivered warm in ~35 minutes.
            </p>
          </motion.div>

          {/* Interactive Category Tabs — prevents repeating the 6 Signature dishes immediately after the tour */}
          <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Menu categories">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 ${
                    active
                      ? "border-[#e9b872] bg-[#e9b872] text-[#17130f] font-medium"
                      : "border-[#e9b872]/20 bg-[#211a14] text-[#c4b5a5] hover:border-[#e9b872]/50 hover:text-[#f6eee3]"
                  }`}
                  data-testid={`menu-tab-${tab.id.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                >
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>

          {visibleGroups.map((group) => (
            <div key={group} className="mt-10 sm:mt-12">
              <div className="mb-5 flex items-center gap-4">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#c4b5a5]">{group}</h3>
                <span className="h-px flex-1 bg-[#e9b872]/15" />
              </div>
              <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {DISHES.filter((d) => d.category === group).map((dish, i) => {
                  const qty = lines[dish.id] ?? 0;
                  return (
                    <motion.article
                      key={dish.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
                      className="group flex flex-col overflow-hidden rounded-3xl border border-[#e9b872]/12 bg-[#211a14] transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#e9b872]/35 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]"
                      data-testid={`menu-card-${dish.id}`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-[#17130f]/75 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#e9b872] backdrop-blur">
                          {dish.tags[0]}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h4 className="font-heading text-xl leading-tight text-[#f6eee3]">{dish.name}</h4>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-[#c4b5a5]">{dish.blurb}</p>
                        <div className="mt-5 flex items-center justify-between">
                          <span className="font-heading text-2xl text-[#f6eee3]" data-testid={`menu-price-${dish.id}`}>
                            {formatINR(dish.price)}
                          </span>
                          {qty > 0 ? (
                            <QtyStepper qty={qty} onChange={(q) => setQty(dish.id, q)} testId={`menu-${dish.id}`} />
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                add(dish.id);
                                toast.success(`${dish.name} added`);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[#c8664a] px-4 py-2 text-sm text-[#f6eee3] transition-[background-color,transform] duration-200 hover:bg-[#c8664a] active:scale-95"
                              data-testid={`menu-add-${dish.id}`}
                            >
                              <Plus className="size-4" /> Add
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {count > 0 && (
        <div className="fixed inset-x-4 bottom-4 z-40 lg:hidden">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex w-full items-center justify-between rounded-full bg-[#c8664a] px-5 py-3.5 text-sm font-medium text-white shadow-[0_12px_36px_rgba(200,102,74,0.5)] transition-transform active:scale-[0.98]"
            data-testid="mobile-cart-bar"
          >
            <span className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-white/20 font-mono text-xs">
                {count}
              </span>
              <span>{count === 1 ? "item" : "items"} in cart</span>
            </span>
            <span className="flex items-center gap-1.5 font-heading text-base font-semibold">
              View cart · {formatINR(subtotal)}
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
