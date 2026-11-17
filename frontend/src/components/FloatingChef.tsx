import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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

function desktopPositionFor(stage: number) {
  if (stage === 0) return { left: "60%", top: "36%", scale: 1 };
  if (stage === 7) return { left: "max(1.5%, calc(50% - 640px))", top: "15%", scale: 0.9 };
  const imageLeft = (stage - 1) % 2 === 0;
  return { left: imageLeft ? "31%" : "51%", top: "48%", scale: 0.95 };
}

export default function FloatingChef({ stage }: { stage: number }) {
  const desktop = useMediaQuery("(min-width: 1024px)");
  const { count } = useCart();
  const [bounceKey, setBounceKey] = useState(0);
  const [bubble, setBubble] = useState<{ station: string; text: string } | null>(null);
  const [cheering, setCheering] = useState(false);
  const bubbleTimer = useRef<number | undefined>(undefined);
  const cheerTimer = useRef<number | undefined>(undefined);
  const prevCount = useRef(count);

  const say = (text: string, ms = desktop ? 5500 : 3800) => {
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
    say(STAGE_LINES[stage] ?? "");
    if (stage === 7) cheer(3200);
  }, [stage]);

  useEffect(() => {
    if (count > prevCount.current) cheer(1600);
    prevCount.current = count;
  }, [count]);

  const mood: ChefMood = cheering ? "cheer" : stage === 0 ? "wave" : "idle";
  const desktopPos = desktopPositionFor(stage);

  const onPoke = () => {
    setBounceKey((k) => k + 1);
    say(TIPS[Math.floor(Math.random() * TIPS.length)], 3500);
  };

  if (!desktop) {
    // Clean, non-overlapping bottom-right dock on mobile
    const mobileBottom = count > 0 ? 84 : 16;
    return (
      <motion.div
        className="fixed right-3 z-30 h-[118px] w-[94px]"
        initial={false}
        animate={{ bottom: mobileBottom }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
        data-testid="chef-mascot"
      >
        <AnimatePresence>
          {bubble && (
            <motion.div
              key={bubble.text}
              initial={{ opacity: 0, y: 8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="pointer-events-none absolute bottom-[98%] right-0 w-[min(230px,74vw)] rounded-2xl border border-[#e9b872]/30 bg-[#17130f]/95 p-3 shadow-2xl backdrop-blur-md"
              data-testid="chef-speech-bubble"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e9b872]">
                Chef Crave · {bubble.station}
              </p>
              <p className="mt-1 text-xs leading-snug text-[#f6eee3]">{bubble.text}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={onPoke}
          className="h-full w-full cursor-pointer rounded-full bg-[#17130f]/40 backdrop-blur-[2px] focus-visible:outline-2 focus-visible:outline-[#e9b872]"
          aria-label="Poke Chef Crave"
          data-testid="chef-mascot-button"
        >
          <ChefCanvas mood={mood} bounceKey={bounceKey} className="pointer-events-none h-full w-full" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed z-30 h-[320px] w-[240px]"
      initial={false}
      animate={{ left: desktopPos.left, top: desktopPos.top, scale: desktopPos.scale }}
      transition={{ type: "spring", stiffness: 60, damping: 16, mass: 1 }}
      data-testid="chef-mascot"
    >
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble.text}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="pointer-events-none absolute bottom-[96%] left-[55%] w-64 rounded-2xl border border-[#e9b872]/30 bg-[#17130f]/90 p-3.5 shadow-2xl backdrop-blur-md"
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
