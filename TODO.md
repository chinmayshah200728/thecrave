# The Fresh Crave implementation

- [x] Extract the supplied 18-second 1280×720 24 FPS footage into 432 sequential WebP frames under `frontend/public/animations/fresh-crave/`, with poster and contact sheet assets.
- [x] Derive the scene timeline from the actual footage: kitchen entrance, avocado toast, harvest bowl, emerald arborio, soup, coconut espresso cooler, pistachio dessert, and short finale hold.
- [x] Build a pinned HTML Canvas sequence driven by GSAP ScrollTrigger progress with reversible scrolling, requestAnimationFrame-friendly image rendering, nearby-frame preloading, resize handling, loading state, fallback, mobile sizing, and reduced-motion behavior.
- [x] Add real HTML overlays with the six existing dish records, tasting notes, prices, stations, safe menu anchors, and final branding CTA.
- [x] Integrate the sequence into the existing homepage without replacing cart, checkout, kitchen, order tracking, or current menu-tour surfaces.
- [x] Make the sequence the primary homepage journey from the first viewport through the six scenes and into the menu, while synchronizing Chef Crave's stage and speech bubble to the active scene.
- [x] Remove the fixed generation marks visible in the supplied footage's extracted frames without changing the original source video file.
- [x] Add route manifest and verify frontend typecheck/build.

## Footage notes

The repository brief described two connected 10-second clips and a final all-dishes branding shot. The supplied asset is one 18-second clip. It has no embedded text, no spoken dialogue, and no all-dishes wide finale. The dessert shot visually shows warm chocolate sauce rather than an unmistakable espresso pour; the soup reads visually as pumpkin/squash even though the existing product data names it Roasted Carrot & Ginger Velouté. The implementation maps the real footage and keeps all product information as HTML overlays.
