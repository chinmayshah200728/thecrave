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

  // Which story section is crossing the middle of the viewport drives Chef Crave.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setStage(Number((e.target as HTMLElement).dataset.stage));
      },
      { rootMargin: "-40% 0px -45% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-stage]").forEach((el) => io.observe(el));

    // Always restore Chef Crave to Hero stage (0) promptly when scrolling back to the top
    const onScroll = () => {
      if (window.scrollY < window.innerHeight * 0.35) {
        setStage(0);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
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
