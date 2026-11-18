import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DISH_BY_ID } from "@/data/dishes";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const FPS = 24;
const FRAME_COUNT = 432;
const FRAME_ROOT = "/animations/fresh-crave/frame_";
const poster = "/animations/fresh-crave/poster.webp";

type Scene = {
  id: string;
  start: number;
  end: number;
  eyebrow: string;
  title?: string;
  station?: string;
  price?: number;
  notes?: string;
};

const scenes: Scene[] = [
  { id: "kitchen", start: 0, end: 2, eyebrow: "The doors are open", title: "A kitchen in motion" },
  { id: "avocado-toast", start: 2, end: 4.5, eyebrow: "The Breakfast Window", title: DISH_BY_ID["avocado-toast"].name, station: "The Breakfast Window", price: 380, notes: "Creamy · Zesty · Crisp" },
  { id: "harvest-bowl", start: 4.5, end: 7, eyebrow: "The Greens Counter", title: DISH_BY_ID["harvest-bowl"].name, station: "The Greens Counter", price: 420, notes: "Fresh · Earthy · Citrusy" },
  { id: "emerald-arborio", start: 7, end: 9.5, eyebrow: "The Risotto Stove", title: DISH_BY_ID["emerald-arborio"].name, station: "The Risotto Stove", price: 540, notes: "Velvety · Herby · Rich" },
  { id: "carrot-veloute", start: 9.5, end: 12, eyebrow: "By the Soup Pot", title: DISH_BY_ID["carrot-veloute"].name, station: "By the Soup Pot", price: 340, notes: "Silky · Sweet · Warming" },
  { id: "coconut-cooler", start: 12, end: 14.5, eyebrow: "The Coffee Counter", title: DISH_BY_ID["coconut-cooler"].name, station: "The Coffee Counter", price: 280, notes: "Bold · Tropical · Smooth" },
  { id: "pistachio-affogato", start: 14.5, end: 17.5, eyebrow: "The Sweet Finish", title: DISH_BY_ID["pistachio-affogato"].name, station: "The Sweet Finish", price: 320, notes: "Nutty · Creamy · Bitter-Sweet" },
  { id: "finale", start: 17.5, end: 18, eyebrow: "The Fresh Crave", title: "Freshly Crafted. Deeply Craved." },
];

const frameUrl = (index: number) => `${FRAME_ROOT}${String(index + 1).padStart(6, "0")}.webp`;

function getScene(seconds: number) {
  return scenes.find((scene) => seconds >= scene.start && seconds < scene.end) ?? scenes[scenes.length - 1];
}

export default function FreshCraveSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = useRef(new Map<number, HTMLImageElement>());
  const frameRef = useRef(0);
  const [loaded, setLoaded] = useState(0);
  const [activeFrame, setActiveFrame] = useState(0);
  const [failed, setFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const activeScene = useMemo(() => getScene(activeFrame / FPS), [activeFrame]);
  const progress = activeFrame / (FRAME_COUNT - 1);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const draw = (index: number) => {
      const image = imageCache.current.get(index);
      if (!image?.complete || !image.naturalWidth) return;
      const ratio = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
      const width = image.naturalWidth * ratio;
      const height = image.naturalHeight * ratio;
      context.fillStyle = "#110e0b";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      draw(frameRef.current);
    };

    const loadFrame = (index: number) => {
      if (index < 0 || index >= FRAME_COUNT || imageCache.current.has(index)) return;
      const image = new Image();
      image.decoding = "async";
      image.src = frameUrl(index);
      image.onload = () => {
        imageCache.current.set(index, image);
        setLoaded((value) => Math.max(value, Math.round((imageCache.current.size / FRAME_COUNT) * 100)));
        if (index === frameRef.current) draw(index);
      };
      image.onerror = () => {
        if (index === 0) setFailed(true);
      };
      imageCache.current.set(index, image);
    };

    const renderFrame = (index: number) => {
      frameRef.current = index;
      setActiveFrame(index);
      loadFrame(index);
      for (let offset = 1; offset <= 8; offset += 1) {
        loadFrame(index + offset);
        if (index - offset >= 0) loadFrame(index - offset);
      }
      draw(index);
    };

    resize();
    loadFrame(0);
    for (let index = 1; index < 18; index += 1) loadFrame(index);
    window.addEventListener("resize", resize);

    let trigger: ScrollTrigger | undefined;
    if (!reducedMotion) {
      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.15,
        onUpdate: (self) => renderFrame(Math.min(FRAME_COUNT - 1, Math.floor(self.progress * (FRAME_COUNT - 1)))),
      });
    } else {
      renderFrame(0);
    }

    return () => {
      trigger?.kill();
      window.removeEventListener("resize", resize);
      imageCache.current.clear();
    };
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} id="cinematic-crave" className={`fresh-sequence ${reducedMotion ? "is-reduced" : ""}`} aria-label="The Fresh Crave cinematic kitchen tour">
      <div className="fresh-sequence__sticky">
        <canvas ref={canvasRef} className="fresh-sequence__canvas" aria-hidden="true" />
        <div className="fresh-sequence__veil" />
        <div className="fresh-sequence__topline">
          <span>THE FRESH CRAVE</span>
          <span>{String(Math.round(progress * 100)).padStart(2, "0")} / 100</span>
        </div>
        <div className="fresh-sequence__copy" aria-live="polite">
          <span className="fresh-sequence__eyebrow">{activeScene.eyebrow}</span>
          <div className="fresh-sequence__rule" />
          {activeScene.title && <h2>{activeScene.title}</h2>}
          {activeScene.station && (
            <div className="fresh-sequence__meta">
              <span>{activeScene.station}</span>
              <span>₹{activeScene.price}</span>
            </div>
          )}
          {activeScene.notes && <p>{activeScene.notes}</p>}
          {activeScene.id !== "kitchen" && activeScene.id !== "finale" && (
            <a className="fresh-sequence__link" href="#menu">Explore dish <span>↗</span></a>
          )}
          {activeScene.id === "finale" && <a className="fresh-sequence__cta" href="#menu">Explore Our Menu <span>↗</span></a>}
        </div>
        <div className="fresh-sequence__progress" style={{ transform: `scaleX(${Math.max(0.01, progress)})` }} />
        <div className="fresh-sequence__hint">{reducedMotion ? "Reduced motion preview" : "Scroll to travel through the kitchen"}</div>
        {!reducedMotion && loaded < 100 && !failed && <div className="fresh-sequence__loader">Loading frames {loaded}%</div>}
        {failed && <div className="fresh-sequence__fallback">The cinematic sequence is unavailable. Continue below to explore the menu.</div>}
      </div>
    </section>
  );
}
