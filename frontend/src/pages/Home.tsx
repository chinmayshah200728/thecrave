import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import MenuSection from "@/components/MenuSection";
import FloatingChef from "@/components/FloatingChef";
import FreshCraveSequence from "@/components/FreshCraveSequence";

export default function Home() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const onSceneChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ stage?: number }>;
      setStage(customEvent.detail?.stage ?? 0);
    };
    window.addEventListener("fresh-crave:scene", onSceneChange);
    return () => window.removeEventListener("fresh-crave:scene", onSceneChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#17130f] text-[#f6eee3]">
      <SiteHeader showProgress />
      <main>
        <FreshCraveSequence />
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
