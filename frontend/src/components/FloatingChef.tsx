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
  quote?: string;
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
      text: "Hi, I'm Chef Crave! Scroll down and I'll walk you through our 6 signature dishes.",
      pairing: "Free delivery on orders above ₹500",
    };
  }
  if (stage >= 1 && stage <= SIGNATURE.length) {
    const dish: Dish = SIGNATURE[stage - 1];
    return {
      station: dish.station ?? `Station 0${stage}`,
      title: dish.name,
      quote: dish.chefLine,
      text: dish.chefDetail ?? dish.story ?? dish.blurb,
      prepTime: dish.prepTime,
      flavorProfile: dish.flavorProfile,
      pairing: dish.pairing,
    };
  }
  return {
    station: "The Order Pass",
    title: "Ready to order?",
    text: "Add our house sides & sips or switch tabs to browse all 9 dishes. Delivered warm in ~35 mins!",
    pairing: "Pay by Cash or UPI on delivery",
  };
}

function SpeechBubble({
  bubble,
  placement = "top-center",
  compact = false,
  onDismiss,
}: {
  bubble: BubbleContent;
  placement?: "top-center" | "top-right" | "side-right" | "side-left";
  compact?: boolean;
  onDismiss: () => void;
}) {
  const posClass =
    placement === "side-right"
      ? "left-[104%] top-6 w-[320px]"
      : placement === "side-left"
        ? "right-[108%] bottom-0 w-[calc(100vw-96px)] max-w-[340px]"
        : placement === "top-center"
          ? "bottom-[102%] left-1/2 -translate-x-1/2 w-[min(355px,calc(100vw-24px))]"
          : "bottom-[102%] right-0 w-[min(330px,calc(100vw-24px))]";

  return (
    <motion.div
      key={`${bubble.station}-${bubble.text}`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`absolute z-40 rounded-2xl border border-[#e9b872]/35 bg-[#17130f]/95 text-left shadow-[0_20px_60px_rgba(0,0,0,0.88)] backdrop-blur-xl ${
        compact ? "p-3" : "p-4 sm:p-5"
      } ${posClass}`}
      data-testid="chef-speech-bubble"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#e9b872]">
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

      {bubble.quote && !compact && (
        <p className="mt-2 font-heading text-base italic leading-snug text-[#e9b872]">
          “{bubble.quote}”
        </p>
      )}

      {!bubble.quote && bubble.title && (
        <p className={`mt-1 font-heading font-medium leading-snug text-[#f6eee3] ${compact ? "text-sm" : "text-base"}`}>
          {bubble.title}
        </p>
      )}

      <p className={`mt-1.5 leading-relaxed text-[#e2d6c8] ${compact ? "text-xs" : "text-[13.5px] sm:text-sm"}`}>
        {bubble.text}
      </p>

      {(bubble.prepTime || bubble.flavorProfile) && (
        <div className={`flex flex-wrap items-center gap-1.5 border-t border-[#e9b872]/15 text-[#e9b872] ${compact ? "mt-2 pt-2 text-[10px]" : "mt-3 pt-3 text-[11px]"}`}>
          {bubble.prepTime && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#2d2319] px-2 py-0.5 font-mono">
              <Clock className="size-3" /> {bubble.prepTime}
            </span>
          )}
          {bubble.flavorProfile && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#2d2319] px-2 py-0.5 font-mono">
              <Sparkles className="size-3" /> {bubble.flavorProfile}
            </span>
          )}
        </div>
      )}

      {bubble.pairing && !compact && (
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

  const showBubble = (content: BubbleContent, autoHideMs?: number) => {
    window.clearTimeout(bubbleTimer.current);
    setBubble(content);
    if (autoHideMs) {
      bubbleTimer.current = window.setTimeout(() => setBubble(null), autoHideMs);
    }
  };

  const cheer = (ms: number) => {
    window.clearTimeout(cheerTimer.current);
    setCheering(true);
    cheerTimer.current = window.setTimeout(() => setCheering(false), ms);
  };

  useEffect(() => {
    setShowingTip(false);
    if (!minimized) {
      // Keep dish tour speech bubble persistently visible while reading (stages 1..6);
      // auto-fade welcome/menu bubbles after a comfortable duration
      const autoHide = stage >= 1 && stage <= SIGNATURE.length ? undefined : 9000;
      showBubble(bubbleForStage(stage), autoHide);
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
    if (!bubble || showingTip) {
      setShowingTip(false);
      const autoHide = stage >= 1 && stage <= SIGNATURE.length ? undefined : 10000;
      showBubble(bubbleForStage(stage), autoHide);
    } else {
      setShowingTip(true);
      showBubble(
        {
          station: "Kitchen Tip",
          text: TIPS[Math.floor(Math.random() * TIPS.length)],
        },
        6000,
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
          const autoHide = stage >= 1 && stage <= SIGNATURE.length ? undefined : 10000;
          showBubble(bubbleForStage(stage), autoHide);
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
  // - Stage 0 (Hero / scrolled back up): centered & larger (135x170) with centered bubble above
  // - Stage >= 1 (Dish Tour & Menu): compact small chef at bottom-right (72x92) with full readable bubble BESIDE him on the left
  //   so it NEVER covers the dish photo, title, price, or Add to Order button!
  if (!desktop) {
    const isHero = stage === 0;
    const mobilePos = isHero
      ? { left: "calc(50vw - 67px)", bottom: 20, width: 135, height: 170 }
      : { left: "calc(100vw - 84px)", bottom: mobileBottom, width: 72, height: 92 };

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
              placement={isHero ? "top-center" : "side-left"}
              compact={!isHero}
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

  // Desktop layout:
  // - Stage 0 (Hero / scrolled back up): large center-stage (280x360) on right half of hero
  // - Stage 1..6 (Dish Tour): glides smoothly into the OPEN OPPOSITE COLUMN of each dish!
  //   Chef Crave & his speech bubble own that entire empty half — ZERO text behind him, ZERO photo overlap!
  // - Stage 7 (Menu): glides cleanly into the left sidebar rail above the cart card
  const isHero = stage === 0;
  const isMenu = stage === 7;
  const dishImageOnLeft = stage >= 1 && stage <= SIGNATURE.length && (stage - 1) % 2 === 0;

  const desktopPos = isHero
    ? { left: "58%", top: "calc(50vh - 180px)", width: 280, height: 360 }
    : isMenu
      ? { left: "max(28px, calc(50vw - 665px))", top: "96px", width: 225, height: 285 }
      : dishImageOnLeft
        ? { left: "65%", top: "calc(50vh - 20px)", width: 240, height: 310 }
        : { left: "15%", top: "calc(50vh - 20px)", width: 240, height: 310 };

  return (
    <motion.div
      className="group fixed z-30"
      initial={false}
      animate={desktopPos}
      transition={{ type: "spring", stiffness: 65, damping: 18, mass: 0.9 }}
      data-testid="chef-mascot"
    >
      <AnimatePresence>
        {bubble && (
          <SpeechBubble
            bubble={bubble}
            placement={isMenu ? "side-right" : "top-center"}
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
