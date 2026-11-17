import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import DishSection from "@/components/DishSection";
import MenuSection from "@/components/MenuSection";
import FloatingChef from "@/components/FloatingChef";
import { SIGNATURE } from "@/data/dishes";

export default function Home() {
  const [stage, setStage] = useState(0);

  // Trigger each stage early as the product enters view (before crossing it),
  // and cleanly restore Stage 0 when scrolling back near the top.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-stage]"));
    let rafId = 0;

    const updateStage = () => {
      rafId = 0;
      if (window.scrollY < window.innerHeight * 0.22) {
        setStage(0);
        return;
      }
      // Announce the next dish as soon as its top enters the lower 28% of the screen (before crossing it)
      const triggerY = window.innerHeight * 0.72;
      let nextStage = 0;
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= triggerY) {
          nextStage = Number(el.dataset.stage);
        }
      }
      setStage(nextStage);
    };

    const onScroll = () => {
      if (!rafId) rafId = window.requestAnimationFrame(updateStage);
    };

    updateStage();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#17130f] text-[#f6eee3]">
      <SiteHeader showProgress />
      <main>
        <HeroSection />
        <div id="tour" className="scroll-mt-16">
          {SIGNATURE.map((dish, i) => (
            <DishSection key={dish.id} dish={dish} index={i} />
          ))}
        </div>
        <MenuSection />
      </main>
      <footer className="border-t border-[#e9b872]/10 bg-[#120f0d] pb-24 lg:pb-0">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-10 font-mono text-[11px] uppercase tracking-[0.2em] text-[#c4b5a5]/70 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-16">
          <span>© The Fresh Crave · A Mumbai cloud kitchen</span>
          <Link to="/kitchen" className="transition-colors duration-200 hover:text-[#e9b872]" data-testid="footer-kitchen-link">
            Kitchen staff →
          </Link>
        </div>
      </footer>
      <FloatingChef stage={stage} />
    </div>
  );
}
