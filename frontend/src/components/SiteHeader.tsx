import { Link } from "react-router-dom";
import { motion, useScroll } from "motion/react";
import { ChefHat, ShoppingBag } from "lucide-react";
import { useCart, LAST_ORDER_KEY } from "@/lib/cart";
import { formatINR } from "@/lib/types";

export default function SiteHeader({ showProgress = false }: { showProgress?: boolean }) {
  const { count, subtotal, setCartOpen } = useCart();
  const { scrollYProgress } = useScroll();
  const lastOrder = typeof window !== "undefined" ? localStorage.getItem(LAST_ORDER_KEY) : null;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#e9b872]/10 bg-[#17130f]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5" data-testid="brand-home-link">
          <ChefHat className="size-5 text-[#e9b872]" strokeWidth={1.6} />
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#f6eee3]">The Fresh Crave</span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.25em] text-[#c4b5a5]/60 md:inline">
            Cloud kitchen · Mumbai
          </span>
        </Link>
        <nav className="ml-auto hidden items-center gap-7 font-mono text-[11px] uppercase tracking-[0.22em] text-[#c4b5a5] md:flex">
          <a href="/#tour" className="transition-colors duration-200 hover:text-[#e9b872]" data-testid="nav-tour-link">
            Kitchen tour
          </a>
          <a href="/#menu" className="transition-colors duration-200 hover:text-[#e9b872]" data-testid="nav-menu-link">
            Menu
          </a>
          {lastOrder && (
            <Link to={`/order/${lastOrder}`} className="transition-colors duration-200 hover:text-[#e9b872]" data-testid="nav-track-order-link">
              Track order
            </Link>
          )}
        </nav>
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="ml-auto flex items-center gap-2.5 rounded-full border border-[#e9b872]/25 bg-[#211a14]/80 py-2 pl-3.5 pr-4 text-sm text-[#f6eee3] transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#e9b872]/60 md:ml-0"
          data-testid="cart-drawer-trigger"
        >
          <ShoppingBag className="size-4 text-[#e9b872]" />
          <span className="font-mono text-xs" data-testid="cart-count">{count}</span>
          {count > 0 && (
            <span className="hidden border-l border-[#e9b872]/20 pl-2.5 sm:inline" data-testid="cart-header-total">
              {formatINR(subtotal)}
            </span>
          )}
        </button>
      </div>
      {showProgress && (
        <motion.div
          className="h-px origin-left bg-gradient-to-r from-[#c8664a] to-[#e9b872]"
          style={{ scaleX: scrollYProgress }}
          data-testid="scroll-progress"
        />
      )}
    </header>
  );
}
