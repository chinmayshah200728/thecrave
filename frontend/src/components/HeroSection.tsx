import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { HERO_IMAGE } from "@/data/dishes";

const STEAM = [12, 22, 31, 44, 58];

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} data-stage={0} className="relative h-[100svh] min-h-[600px] sm:min-h-[680px] overflow-hidden" data-testid="hero-section">
      <motion.div className="absolute inset-0 -top-[6%] h-[115%]" style={{ y: bgY }}>
        <img src={HERO_IMAGE} alt="Warm cloud kitchen interior" className="h-full w-full object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,19,15,0.75)_0%,rgba(23,19,15,0.65)_55%,rgba(18,15,13,0.95)_100%)] lg:bg-[linear-gradient(90deg,rgba(23,19,15,0.92)_0%,rgba(23,19,15,0.6)_50%,rgba(23,19,15,0.35)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#120f0d]" />
      <div className="pointer-events-none absolute inset-0">
        {STEAM.map((left, i) => (
          <span
            key={left}
            className="absolute bottom-[30%] h-24 w-8 rounded-full bg-[#f6eee3]/10 blur-xl animate-steam"
            style={{ left: `${left + 30}%`, animationDelay: `${i * 1.1}s` }}
          />
        ))}
      </div>

      <motion.div style={{ y: textY, opacity: fade }} className="relative mx-auto flex h-full max-w-[1400px] flex-col justify-start pt-22 sm:pt-24 lg:justify-center lg:pt-16 px-5 sm:px-8 lg:px-16">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] sm:tracking-[0.28em] text-[#e9b872]" data-testid="hero-overline">
          Mumbai · Made fresh — a cinematic food journey
        </motion.p>
        <h1 className="mt-3 sm:mt-5 max-w-3xl font-heading text-[clamp(2.35rem,8.5vw,7.5rem)] leading-[0.94] sm:leading-[0.88] tracking-[-0.03em] text-[#f6eee3]" data-testid="hero-title">
          {["Fresh food.", "Thoughtfully", "craved."].map((line, i) => (
            <motion.span key={line} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }} className={`block ${i === 1 ? "italic text-[#e9b872]" : ""}`}>
              {line}
            </motion.span>
          ))}
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.75 }} className="mt-4 sm:mt-6 max-w-md text-sm sm:text-lg leading-relaxed text-[#d4c7b8]">
          Walk through our kitchen with Chef Crave — six signature cravings, cooked to order and delivered warm to your door.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.9 }} className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4 sm:gap-6">
          <a href="#tour" className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#c8664a] px-6 py-3 sm:px-7 sm:py-4 text-sm sm:text-[15px] font-medium text-white shadow-[0_10px_40px_-10px_rgba(200,102,74,0.7)] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#d9775c]" data-testid="explore-tour-btn">
            Step into the kitchen
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
          <a href="#menu" className="inline-flex items-center gap-2 border-b border-[#e9b872]/40 pb-1 font-mono text-[11px] uppercase tracking-[0.22em] text-[#f6eee3] transition-colors duration-200 hover:border-[#e9b872] hover:text-[#e9b872]" data-testid="hero-order-now-link">
            Skip to the menu <ArrowDown className="size-3.5" />
          </a>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-3 left-1/2 hidden sm:flex -translate-x-1/2 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4b5a5]/70">
        Scroll to step inside <ArrowDown className="size-3 animate-bounce" />
      </div>
    </section>
  );
}
