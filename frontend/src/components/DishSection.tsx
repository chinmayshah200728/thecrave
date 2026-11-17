import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Dish } from "@/data/dishes";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/types";

export default function DishSection({ dish, index }: { dish: Dish; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const { add } = useCart();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1, 1.06]);
  const numY = useTransform(scrollYProgress, [0, 1], [120, -160]);
  const imageLeft = index % 2 === 0;
  const n = String(index + 1).padStart(2, "0");

  const reveal = {
    initial: { opacity: 0, y: 36 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.4 },
  };

  return (
    <section
      ref={ref}
      data-stage={index + 1}
      className="relative overflow-hidden bg-[#120f0d] py-14 sm:py-20 lg:flex lg:min-h-screen lg:items-center lg:py-28"
      data-testid={`dish-section-${dish.id}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(60% 50% at ${imageLeft ? "25%" : "75%"} 50%, rgba(200,102,74,0.14), transparent 70%)`,
        }}
      />
      <motion.span
        style={{ y: numY }}
        className={`pointer-events-none absolute top-1/4 select-none font-heading text-[28vw] leading-none text-[#e9b872]/[0.04] ${
          imageLeft ? "right-[2%]" : "left-[2%]"
        }`}
      >
        {n}
      </motion.span>

      <div
        className={`relative mx-auto grid max-w-[1400px] items-center gap-8 sm:gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-16 ${
          imageLeft ? "" : "lg:[&>*:first-child]:order-2"
        }`}
      >
        <div className={`lg:col-span-6 ${imageLeft ? "" : "lg:col-start-7"}`}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:rounded-[28px] border border-[#e9b872]/15 shadow-[0_24px_80px_-25px_rgba(0,0,0,0.85)] sm:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] sm:aspect-[5/5]">
            <motion.img
              src={dish.image}
              alt={dish.name}
              loading="lazy"
              style={{ y: imgY, scale: imgScale }}
              className="absolute inset-0 -top-[10%] h-[120%] w-full object-cover"
              data-testid={`dish-image-${dish.id}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#120f0d]/70 via-transparent to-transparent" />
            <span className="absolute left-4 top-4 sm:left-5 sm:top-5 rounded-full border border-[#e9b872]/30 bg-[#17130f]/75 px-3 py-1 sm:py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#e9b872] backdrop-blur-md">
              Station {n} / 06
            </span>
          </div>
        </div>

        <div className={`lg:col-span-5 ${imageLeft ? "lg:col-start-8" : "lg:col-start-1"}`}>
          <motion.p
            {...reveal}
            transition={{ duration: 0.7 }}
            className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.24em] sm:tracking-[0.28em] text-[#e9b872]"
          >
            {n} · {dish.station}
          </motion.p>
          <motion.h2
            {...reveal}
            transition={{ duration: 0.8, delay: 0.08 }}
            className="mt-3 sm:mt-5 font-heading text-[clamp(2rem,5vw,4.5rem)] leading-[0.98] sm:leading-[0.95] tracking-[-0.02em] text-[#f6eee3]"
            data-testid={`dish-title-${dish.id}`}
          >
            {dish.name}
          </motion.h2>
          <motion.p
            {...reveal}
            transition={{ duration: 0.8, delay: 0.16 }}
            className="mt-4 sm:mt-6 max-w-md text-sm sm:text-lg leading-relaxed text-[#d4c7b8]"
          >
            {dish.story}
          </motion.p>
          <motion.blockquote
            {...reveal}
            transition={{ duration: 0.8, delay: 0.22 }}
            className="mt-4 sm:mt-6 max-w-md border-l border-[#e9b872]/40 pl-3.5 sm:pl-4 font-heading text-base sm:text-lg italic text-[#e9b872]/90"
          >
            “{dish.chefLine}”
          </motion.blockquote>
          <motion.div {...reveal} transition={{ duration: 0.8, delay: 0.28 }} className="mt-4 sm:mt-6 flex flex-wrap gap-2">
            {dish.tags.map((t) => (
              <span key={t} className="rounded-full bg-[#2d2319] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#e9b872]">
                {t}
              </span>
            ))}
          </motion.div>
          <motion.div {...reveal} transition={{ duration: 0.8, delay: 0.34 }} className="mt-7 sm:mt-9 flex items-center justify-between sm:justify-start sm:gap-6">
            <span className="font-heading text-2xl sm:text-3xl text-[#f6eee3]" data-testid={`dish-price-${dish.id}`}>
              {formatINR(dish.price)}
            </span>
            <button
              type="button"
              onClick={() => {
                add(dish.id);
                toast.success(`${dish.name} added to your order`);
              }}
              className="group inline-flex items-center gap-2 rounded-full bg-[#c8664a] px-5 py-3 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#d9775c] active:scale-95"
              data-testid={`dish-add-${dish.id}`}
            >
              <Plus className="size-4 transition-transform duration-200 group-hover:rotate-90" /> Add to order
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
