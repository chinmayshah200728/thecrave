import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Dish } from "@/data/dishes";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/types";
import QtyStepper from "@/components/QtyStepper";

export default function DishSection({ dish, index }: { dish: Dish; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const { lines, add, setQty } = useCart();
  const qty = lines[dish.id] ?? 0;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1, 1.06]);
  const numY = useTransform(scrollYProgress, [0, 1], [90, -120]);
  const cardY = useTransform(scrollYProgress, [0, 0.45, 1], [36, 0, -24]);

  const imageLeft = index % 2 === 0;
  const n = String(index + 1).padStart(2, "0");

  const reveal = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
  };

  return (
    <section
      ref={ref}
      data-stage={index + 1}
      className="relative flex min-h-[92svh] items-start overflow-hidden bg-[#120f0d] pb-56 pt-20 sm:pb-60 lg:min-h-screen lg:items-center lg:py-24"
      data-testid={`dish-section-${dish.id}`}
    >
      {/* Warm ambient glow behind the photo side */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(60% 50% at ${imageLeft ? "25%" : "75%"} 45%, rgba(200,102,74,0.15), transparent 70%)`,
        }}
      />

      {/* Parallax station number watermark */}
      <motion.span
        style={{ y: numY }}
        className={`pointer-events-none absolute top-16 select-none font-heading text-[34vw] leading-none text-[#e9b872]/[0.04] lg:top-1/4 lg:text-[26vw] ${
          imageLeft ? "right-[3%]" : "left-[3%]"
        }`}
      >
        {n}
      </motion.span>

      <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-8 px-5 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:px-16">
        {/* Photo + Title + Price + Add to Order cleanly grouped together; opposite column stays open for Chef Crave */}
        <motion.div
          style={{ y: cardY }}
          className={`lg:col-span-6 ${imageLeft ? "lg:col-start-1" : "lg:col-start-7"}`}
        >
          {/* Animated Parallax Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[16/11] overflow-hidden rounded-3xl border border-[#e9b872]/15 shadow-[0_30px_90px_-25px_rgba(0,0,0,0.9)] sm:aspect-[5/4]"
          >
            <motion.img
              src={dish.image}
              alt={dish.name}
              loading="lazy"
              style={{ y: imgY, scale: imgScale }}
              className="absolute inset-0 -top-[10%] h-[120%] w-full object-cover"
              data-testid={`dish-image-${dish.id}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#120f0d]/75 via-transparent to-transparent" />
            <span className="absolute left-4 top-4 rounded-full border border-[#e9b872]/30 bg-[#17130f]/75 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#e9b872] backdrop-blur-md">
              Station {n} / 06
            </span>
          </motion.div>

          {/* Dish Title, Tags, Price & Add to Order directly UNDER the photo */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 rounded-3xl border border-[#e9b872]/12 bg-[#1a1510]/90 p-5 backdrop-blur-md sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#e9b872]">
                {n} · {dish.station}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {dish.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-[#2d2319] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#e9b872]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <h2
              className="mt-2.5 font-heading text-2xl leading-tight tracking-[-0.02em] text-[#f6eee3] sm:text-4xl"
              data-testid={`dish-title-${dish.id}`}
            >
              {dish.name}
            </h2>

            <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#e9b872]/12 pt-4">
              <span className="font-heading text-2xl text-[#f6eee3] sm:text-3xl" data-testid={`dish-price-${dish.id}`}>
                {formatINR(dish.price)}
              </span>
              {qty > 0 ? (
                <QtyStepper qty={qty} onChange={(q) => setQty(dish.id, q)} testId={`dish-${dish.id}`} />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    add(dish.id);
                    toast.success(`${dish.name} added to your order`);
                  }}
                  className="group inline-flex items-center gap-2 rounded-full bg-[#c8664a] px-5 py-3 text-sm font-medium text-white shadow-[0_8px_28px_-6px_rgba(200,102,74,0.65)] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#d9775c] active:scale-95"
                  data-testid={`dish-add-${dish.id}`}
                >
                  <Plus className="size-4 transition-transform duration-200 group-hover:rotate-90" /> Add to order
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Dedicated open space for Chef Crave & his speech bubble on desktop */}
        <div className={`hidden lg:block lg:col-span-5 ${imageLeft ? "lg:col-start-8" : "lg:col-start-1 lg:row-start-1"}`} aria-hidden />
      </div>
    </section>
  );
}
