import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChefHat, X } from "lucide-react";
import ChefCanvas, { type ChefMood } from "@/components/ChefCanvas";
import { SIGNATURE } from "@/data/dishes";
import { useCart } from "@/lib/cart";
import { useMediaQuery } from "@/lib/useMediaQuery";

const STAGE_LINES = [
  "Hi, I'm Chef Crave! Scroll with me — six cravings, cooked fresh in our kitchen.",
  ...SIGNATURE.map((d) => d.chefLine ?? ""),
  "Hungry? Build your order — I'll get the pans hot!",
];

const TIPS = [
  "Psst — orders over ₹500 ride free.",
  "Careful, I'm holding a very hot pan!",
  "Salt your pasta water like the sea. Well… almost.",
  "Every plate leaves my pass within 25 minutes.",
  "Pay cash or UPI when it reaches your door.",
  "Hehe, that tickles!",
];

const STATIONS = ["Kitchen door", ...SIGNATURE.map((d) => d.station ?? ""), "The order pass"];

export default function FloatingChef({ stage }: { stage: number }) {
  const desktop = useMediaQuery("(min-width: 1024px)");
  const { count } = useCart();
  const [bounceKey, setBounceKey] = useState(0);
  const [bubble, setBubble] = useState<{ station: string; text: string } | null>(null);
  const [cheering, setCheering] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const bubbleTimer = useRef<number | undefined>(undefined);
  const cheerTimer = useRef<number | undefined>(undefined);
  const prevCount = useRef(count);

  const say = (text: string, ms = desktop ? 4500 : 3200) => {
    window.clearTimeout(bubbleTimer.current);
    setBubble({ station: STATIONS[stage] ?? "", text });
    bubbleTimer.current = window.setTimeout(() => setBubble(null), ms);
  };
  const cheer = (ms: number) => {
    window.clearTimeout(cheerTimer.current);
    setCheering(true);
    cheerTimer.current = window.setTimeout(() => setCheering(false), ms);
  };

  useEffect(() => {
    if (!minimized) {
      say(STAGE_LINES[stage] ?? "");
    }
    if (stage === 7) cheer(2800);
  }, [stage]);

  useEffect(() => {
    if (count > prevCount.current) cheer(1600);
    prevCount.current = count;
  }, [count]);

  const mood: ChefMood = cheering ? "cheer" : stage === 0 ? "wave" : "idle";

  const onPoke = () => {
    setBounceKey((k) => k + 1);
    say(TIPS[Math.floor(Math.random() * TIPS.length)], 3200);
  };

  const mobileBottom = count > 0 ? 84 : 16;

  // Minimized pill state (works cleanly on both mobile & desktop)
  if (minimized) {
    return (
      <motion.button
        type="button"
        onClick={() => {
          setMinimized(false);
          say(STAGE_LINES[stage] ?? "", 3500);
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, bottom: desktop ? 24 : mobileBottom }}
        className="fixed right-4 z-30 flex items-center gap-2 rounded-full border border-[#e9b872]/35 bg-[#17130f]/90 px-3.5 py-2.5 text-xs font-mono uppercase tracking-[0.16em] text-[#e9b872] shadow-2xl backdrop-blur-md transition-colors hover:border-[#e9b872]"
        aria-label="Show Chef Crave"
        data-testid="chef-restore-button"
      >
        <ChefHat className="size-4" />
        <span className="hidden sm:inline">Chef Crave</span>
      </motion.button>
    );
  }

  // Mobile layout: strictly bounded inside bottom-right corner, never overflows viewport
  if (!desktop) {
    return (
      <motion.div
        className="fixed right-3 z-30 h-[96px] w-[76px]"
        initial={false}
        animate={{ bottom: mobileBottom }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        data-testid="chef-mascot"
      >
        <AnimatePresence>
          {bubble && (
            <motion.div
              key={bubble.text}
              initial={{ opacity: 0, y: 6, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="pointer-events-none absolute bottom-[104%] right-0 w-[min(220px,calc(100vw-24px))] rounded-2xl border border-[#e9b872]/30 bg-[#17130f]/95 p-2.5 shadow-2xl backdrop-blur-md"
              data-testid="chef-speech-bubble"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#e9b872]">
                Chef Crave · {bubble.station}
              </p>
              <p className="mt-1 text-xs leading-snug text-[#f6eee3]">{bubble.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setMinimized(true)}
          aria-label="Minimize Chef Crave"
          className="absolute -right-1 -top-1 z-10 grid size-5 place-items-center rounded-full border border-[#e9b872]/30 bg-[#17130f]/90 text-[#c4b5a5] hover:text-[#f6eee3]"
        >
          <X className="size-3" />
        </button>

        <button
          type="button"
          onClick={onPoke}
          className="h-full w-full cursor-pointer overflow-hidden rounded-full border border-[#e9b872]/20 bg-[#17130f]/60 shadow-xl backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-[#e9b872]"
          aria-label="Poke Chef Crave"
          data-testid="chef-mascot-button"
        >
          <ChefCanvas mood={mood} bounceKey={bounceKey} className="pointer-events-none h-full w-full" />
        </button>
      </motion.div>
    );
  }

  // Desktop layout: uses consistent left/top/scale for smooth spring motion,
  // while NEVER overlapping dish photos or sitting in between photo & copy:
  // - Stage 0 (Hero): stands cleanly on the open right side of the hero
  // - Stage 1..6 (Dish Tour): glides neatly to the bottom-right corner, clear of photos & text
  // - Stage 7 (Menu): glides into the dedicated left sidebar slot above the cart card
  const isHero = stage === 0;
  const isMenu = stage === 7;

  const desktopTarget = isHero
    ? { left: "calc(100vw - 290px)", top: "calc(50vh - 150px)", scale: 1 }
    : isMenu
      ? { left: "max(28px, calc(50vw - 665px))", top: "96px", scale: 0.88 }
      : { left: "calc(100vw - 215px)", top: "calc(100vh - 280px)", scale: 0.68 };

  return (
    <motion.div
      className="group fixed z-30 h-[300px] w-[220px] origin-center"
      initial={false}
      animate={desktopTarget}
      transition={{ type: "spring", stiffness: 65, damping: 18, mass: 0.9 }}
      data-testid="chef-mascot"
    >
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble.text}
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className={`pointer-events-none absolute bottom-[96%] w-60 rounded-2xl border border-[#e9b872]/30 bg-[#17130f]/92 p-3.5 shadow-2xl backdrop-blur-md ${
              isMenu ? "left-2" : "right-0"
            }`}
            data-testid="chef-speech-bubble"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e9b872]">
              Chef Crave · {bubble.station}
            </p>
            <p className="mt-1.5 text-sm leading-snug text-[#f6eee3]">{bubble.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setMinimized(true)}
        aria-label="Minimize Chef Crave"
        className="absolute right-1 top-1 z-10 grid size-6 place-items-center rounded-full border border-[#e9b872]/25 bg-[#17130f]/85 text-[#c4b5a5] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[#f6eee3]"
      >
        <X className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={onPoke}
        className="h-full w-full cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-[#e9b872]"
        aria-label="Poke Chef Crave"
        data-testid="chef-mascot-button"
      >
        <ChefCanvas mood={mood} bounceKey={bounceKey} className="pointer-events-none h-full w-full" />
      </button>
    </motion.div>
  );
}
