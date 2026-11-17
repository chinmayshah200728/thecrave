import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { SIGNATURE } from "@/data/dishes";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/types";
import QtyStepper from "@/components/QtyStepper";

export default function MobileTourCarousel({ onSlideChange }: { onSlideChange: (stage: number) => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const { lines, add, setQty } = useCart();

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.clientWidth;
    if (!cardWidth) return;
    const idx = Math.round(el.scrollLeft / cardWidth);
    const clamped = Math.max(0, Math.min(SIGNATURE.length - 1, idx));
    if (clamped !== activeIdx) {
      setActiveIdx(clamped);
      onSlideChange(clamped + 1);
    }
  };

  const scrollToIdx = (idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(SIGNATURE.length - 1, idx));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    setActiveIdx(clamped);
    onSlideChange(clamped + 1);
  };

  return (
    <section data-stage={activeIdx + 1} className="bg-[#120f0d] py-12 lg:hidden" data-testid="mobile-tour-carousel">
      <div className="px-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#e9b872]">
              Kitchen tour · 06 signature cravings
            </p>
            <h2 className="mt-2 font-heading text-3xl leading-tight text-[#f6eee3]">
              Chef&apos;s <span className="italic text-[#e9b872]">Signatures</span>
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollToIdx(activeIdx - 1)}
              disabled={activeIdx === 0}
              aria-label="Previous dish"
              className="grid size-8 place-items-center rounded-full border border-[#e9b872]/25 bg-[#1b1611] text-[#f6eee3] disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToIdx(activeIdx + 1)}
              disabled={activeIdx === SIGNATURE.length - 1}
              aria-label="Next dish"
              className="grid size-8 place-items-center rounded-full border border-[#e9b872]/25 bg-[#1b1611] text-[#f6eee3] disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="mt-6 flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SIGNATURE.map((dish, i) => {
          const n = String(i + 1).padStart(2, "0");
          const qty = lines[dish.id] ?? 0;
          return (
            <div key={dish.id} className="w-full shrink-0 snap-center px-5">
              <article className="overflow-hidden rounded-3xl border border-[#e9b872]/15 bg-[#1b1611] shadow-2xl">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={dish.image} alt={dish.name} loading="lazy" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1b1611] via-transparent to-transparent" />
                  <span className="absolute left-3.5 top-3.5 rounded-full border border-[#e9b872]/30 bg-[#17130f]/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#e9b872] backdrop-blur-md">
                    Station {n} / 06
                  </span>
                </div>
                <div className="p-5 pt-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#e9b872]">{dish.station}</p>
                  <h3 className="mt-1.5 font-heading text-2xl leading-tight text-[#f6eee3]">{dish.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#d4c7b8]">{dish.story}</p>
                  <blockquote className="mt-3 border-l border-[#e9b872]/40 pl-3 font-heading text-sm italic text-[#e9b872]/90">
                    “{dish.chefLine}”
                  </blockquote>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {dish.tags.map((t) => (
                      <span key={t} className="rounded-full bg-[#2d2319] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#e9b872]">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-[#e9b872]/10 pt-4">
                    <span className="font-heading text-2xl text-[#f6eee3]">{formatINR(dish.price)}</span>
                    {qty > 0 ? (
                      <QtyStepper qty={qty} onChange={(q) => setQty(dish.id, q)} testId={`tour-mobile-${dish.id}`} />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          add(dish.id);
                          toast.success(`${dish.name} added to your order`);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#c8664a] px-4 py-2.5 text-sm font-medium text-white active:scale-95"
                        data-testid={`tour-mobile-add-${dish.id}`}
                      >
                        <Plus className="size-4" /> Add to order
                      </button>
                    )}
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </div>

      {/* Pagination dots */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {SIGNATURE.map((dish, i) => (
          <button
            key={dish.id}
            type="button"
            onClick={() => scrollToIdx(i)}
            aria-label={`Go to station ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIdx ? "w-6 bg-[#e9b872]" : "w-1.5 bg-[#e9b872]/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
