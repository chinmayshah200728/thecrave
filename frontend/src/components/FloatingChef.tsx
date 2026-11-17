import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChefHat, Clock, Sparkles, UtensilsCrossed, X } from "lucide-react";
import ChefCanvas, { type ChefMood } from "@/components/ChefCanvas";
import { SIGNATURE, type Dish } from "@/data/dishes";
import { useCart } from "@/lib/cart";
import { useMediaQuery } from "@/lib/useMediaQuery";

interface BubbleContent {
  station: string;
  title?: string;
  text: string;
  prepTime?: string;
  flavorProfile?: string;
  pairing?: string;
}

const TIPS = [
  "Psst — orders over ₹500 get free delivery across Mumbai!",
  "Every single plate leaves my pass within 25 minutes, cooked fresh to order.",
  "Careful, I'm holding a very hot cast-iron pan!",
  "No online payment needed — pay by cash or UPI right at your door.",
  "Pro tip: Pair our Emerald Arborio with Rosemary Truffle Fries!",
  "Hehe, that tickles! Tap any dish to add it straight to your bag.",
];

function bubbleForStage(stage: number): BubbleContent {
  if (stage === 0) {
    return {
      station: "Kitchen Door",
      title: "Welcome to The Fresh Crave!",
      text: "Hi, I'm Chef Crave! Scroll with me through our 6 signature dishes — cooked fresh to order in our Mumbai cloud kitchen.",
      pairing: "Free delivery on orders above ₹500",
    };
  }
  if (stage >= 1 && stage <= SIGNATURE.length) {
    const dish: Dish = SIGNATURE[stage - 1];
    return {
      station: dish.station ?? `Station 0${stage}`,
      title: dish.name,
      text: dish.chefDetail ?? dish.chefLine ?? dish.blurb,
      prepTime: dish.prepTime,
      flavorProfile: dish.flavorProfile,
      pairing: dish.pairing,
    };
  }
  return {
    station: "The Order Pass",
    title: "Ready to order?",
    text: "Mix and match our Signatures with freshly brewed Masala Chai, Truffle Fries, or Berry Parfait. Packed warm, at your door in ~35 mins!",
    pairing: "Pay by Cash or UPI on delivery",
  };
}

function SpeechBubble({
  bubble,
  placement = "top-right",
  onDismiss,
}: {
  bubble: BubbleContent;
  placement?: "top-right" | "top-center" | "side-right";
  onDismiss: () => void;
}) {
  const posClass =
    placement === "side-right"
      ? "left-[104%] top-6"
      : placement === "top-center"
        ? "bottom-[102%] left-1/2 -translate-x-1/2"
        : "bottom-[102%] right-0";

  return (
    <motion.div
      key={`${bubble.station}-${bubble.text}`}
      initial={{ opacity: 0, y: 10, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`absolute z-40 w-[min(315px,calc(100vw-24px))] rounded-2xl border border-[#e9b872]/35 bg-[#17130f]/95 p-4 text-left shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl ${posClass}`}
      data-testid="chef-speech-bubble"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e9b872]">
          Chef Crave · {bubble.station}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          aria-label="Close chef note"
          className="grid size-5 shrink-0 place-items-center rounded-full text-[#c4b5a5] transition-colors hover:bg-[#e9b872]/15 hover:text-[#f6eee3]"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {bubble.title && (
        <p className="mt-1.5 font-heading text-base font-medium leading-snug text-[#f6eee3]">
          {bubble.title}
        </p>
      )}

      <p className="mt-1.5 text-[13px] leading-relaxed text-[#d9cdbf]">{bubble.text}</p>

      {(bubble.prepTime || bubble.flavorProfile) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#e9b872]/15 pt-2.5 text-[11px] text-[#e9b872]">
          {bubble.prepTime && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#2d2319] px-2.5 py-0.5 font-mono">
              <Clock className="size-3" /> {bubble.prepTime}
            </span>
          )}
          {bubble.flavorProfile && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#2d2319] px-2.5 py-0.5 font-mono">
              <Sparkles className="size-3" /> {bubble.flavorProfile}
            </span>
          )}
        </div>
      )}

      {bubble.pairing && (
        <p className="mt-2.5 flex items-center gap-1.5 text-xs italic text-[#e9b872]/90">
          <UtensilsCrossed className="size-3 shrink-0" />
          <span>{bubble.pairing}</span>
        </p>
      )}
    </motion.div>
  );
}

export default function FloatingChef({ stage }: { stage: number }) {
  const desktop = useMediaQuery("(min-width: 1024px)");
  const { count } = useCart();
  const [bounceKey, setBounceKey] = useState(0);
  const [bubble, setBubble] = useState<BubbleContent | null>(null);
  const [cheering, setCheering] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [showingTip, setShowingTip] = useState(false);
  const bubbleTimer = useRef<number | undefined>(undefined);
  const cheerTimer = useRef<number | undefined>(undefined);
  const prevCount = useRef(count);

  const showBubble = (content: BubbleContent, ms = 12000) => {
    window.clearTimeout(bubbleTimer.current);
    setBubble(content);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), ms);
  };

  const cheer = (ms: number) => {
    window.clearTimeout(cheerTimer.current);
    setCheering(true);
    cheerTimer.current = window.setTimeout(() => setCheering(false), ms);
  };

  useEffect(() => {
    setShowingTip(false);
    if (!minimized) {
      showBubble(bubbleForStage(stage), desktop ? 14000 : 10000);
    }
    if (stage === 7) cheer(2800);
  }, [stage, desktop]);

  useEffect(() => {
    if (count > prevCount.current) cheer(1600);
    prevCount.current = count;
  }, [count]);

  const mood: ChefMood = cheering ? "cheer" : stage === 0 ? "wave" : "idle";

  const onPoke = () => {
    setBounceKey((k) => k + 1);
    // If bubble was closed or showing a tip, show the rich dish info for current stage;
    // otherwise cycle to a fun kitchen tip
    if (!bubble || showingTip) {
      setShowingTip(false);
      showBubble(bubbleForStage(stage), 14000);
    } else {
      setShowingTip(true);
      showBubble(
        {
          station: "Kitchen Tip",
          text: TIPS[Math.floor(Math.random() * TIPS.length)],
        },
        7000,
      );
    }
  };

  const mobileBottom = count > 0 ? 84 : 16;

  // Minimized pill state
  if (minimized) {
    return (
      <motion.button
        type="button"
        onClick={() => {
          setMinimized(false);
          showBubble(bubbleForStage(stage), 12000);
        }}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, bottom: desktop ? 24 : mobileBottom }}
        className="fixed right-4 z-30 flex items-center gap-2 rounded-full border border-[#e9b872]/40 bg-[#17130f]/95 px-4 py-2.5 text-xs font-mono uppercase tracking-[0.16em] text-[#e9b872] shadow-2xl backdrop-blur-md transition-colors hover:border-[#e9b872]"
        aria-label="Show Chef Crave"
        data-testid="chef-restore-button"
      >
        <ChefHat className="size-4" />
        <span>Ask Chef Crave</span>
      </motion.button>
    );
  }

  // Mobile layout:
  // - Stage 0 (top / scrolled back up): glides right back to the CENTER in large size (170x215)
  // - Stage >= 1 (tour & menu): glides neatly to the bottom-right corner (104x132), strictly inside viewport
  if (!desktop) {
    const isHero = stage === 0;
    const mobilePos = isHero
      ? { left: "calc(50vw - 85px)", bottom: 24, width: 170, height: 215 }
      : { left: "calc(100vw - 116px)", bottom: mobileBottom, width: 104, height: 132 };

    return (
      <motion.div
        className="fixed z-30"
        initial={false}
        animate={mobilePos}
        transition={{ type: "spring", stiffness: 120, damping: 20, mass: 0.9 }}
        data-testid="chef-mascot"
      >
        <AnimatePresence>
          {bubble && (
            <SpeechBubble
              bubble={bubble}
              placement={isHero ? "top-center" : "top-right"}
              onDismiss={() => setBubble(null)}
            />
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setMinimized(true)}
          aria-label="Minimize Chef Crave"
          className="absolute -right-1 -top-1 z-10 grid size-6 place-items-center rounded-full border border-[#e9b872]/35 bg-[#17130f]/95 text-[#c4b5a5] shadow-md hover:text-[#f6eee3]"
        >
          <X className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={onPoke}
          className={`h-full w-full cursor-pointer overflow-hidden rounded-full focus-visible:outline-2 focus-visible:outline-[#e9b872] ${
            isHero
              ? ""
              : "border border-[#e9b872]/25 bg-[#17130f]/65 shadow-2xl backdrop-blur-xs"
          }`}
          aria-label="Poke Chef Crave for dish info"
          data-testid="chef-mascot-button"
        >
          <ChefCanvas mood={mood} bounceKey={bounceKey} className="pointer-events-none h-full w-full" />
        </button>
      </motion.div>
    );
  }

  // Desktop layout: NO CSS scale shrinking on parent so speech bubble text is ALWAYS 100% sharp & readable.
  // - Stage 0 (Hero / scrolled back up): returns to center-stage in his grand large size (280x360)
  // - Stage 1..6 (Dish Tour): generously sized (195x250) in the bottom-right corner, clear of dish photos
  // - Stage 7 (Menu): stands in the dedicated left sidebar rail above the cart card
  const isHero = stage === 0;
  const isMenu = stage === 7;

  const desktopPos = isHero
    ? { left: "56%", top: "calc(50vh - 180px)", width: 280, height: 360 }
    : isMenu
      ? { left: "max(28px, calc(50vw - 665px))", top: "96px", width: 225, height: 285 }
      : { left: "calc(100vw - 220px)", top: "calc(100vh - 265px)", width: 195, height: 250 };

  return (
    <motion.div
      className="group fixed z-30"
      initial={false}
      animate={desktopPos}
      transition={{ type: "spring", stiffness: 70, damping: 18, mass: 0.9 }}
      data-testid="chef-mascot"
    >
      <AnimatePresence>
        {bubble && (
          <SpeechBubble
            bubble={bubble}
            placement={isMenu ? "side-right" : "top-right"}
            onDismiss={() => setBubble(null)}
          />
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setMinimized(true)}
        aria-label="Minimize Chef Crave"
        className="absolute right-1 top-1 z-10 grid size-6 place-items-center rounded-full border border-[#e9b872]/30 bg-[#17130f]/90 text-[#c4b5a5] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[#f6eee3]"
      >
        <X className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={onPoke}
        className="h-full w-full cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-[#e9b872]"
        aria-label="Poke Chef Crave for dish info"
        data-testid="chef-mascot-button"
      >
        <ChefCanvas mood={mood} bounceKey={bounceKey} className="pointer-events-none h-full w-full" />
      </button>
    </motion.div>
  );
}
