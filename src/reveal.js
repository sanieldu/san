// "Notes become the menu": the reveal that runs after "click me".
// Kept in its own module so it can be swapped (e.g. for a version where he slides aside and the text appears beside him).
// Contract: reveal(parts) animates from the walked-on stage to the finished home page and resolves when done.
import { gsap } from "gsap";

function spawnNote(layer, x, y) {
  const n = document.createElement("span");
  n.className = "note";
  layer.append(n);
  gsap.set(n, { x: x - 9, y: y - 12 });
  return n;
}

const center = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

/**
 * @param {object} p
 * @param {HTMLElement} p.intro       the black stage overlay
 * @param {HTMLElement} p.figure      the walked-on silhouette's wrapper on stage
 * @param {HTMLElement} p.slot        where the silhouette lives on the home page
 * @param {SVGElement}  p.bell        a point at the trumpet's bell
 * @param {HTMLElement} p.layer       a fixed layer to draw flying notes in
 * @param {number}      p.duration    seconds of audio to time the notes to
 */
export function reveal({ intro, figure, slot, bell, layer, duration }) {
  const tl = gsap.timeline();
  const from = () => center(bell); // the bell moves as he plays, so read it at each launch
  const stream = Math.max(8, Math.round(duration * 5));

  // A curving stream of notes out of the bell for as long as the lick plays.
  for (let i = 0; i < stream; i++) {
    tl.add(() => {
      const { x, y } = from();
      const n = spawnNote(layer, x, y);
      const rise = 120 + Math.random() * 160;
      const run = 140 + Math.random() * 260;
      gsap.to(n, {
        keyframes: [
          { x: `+=${run * 0.4}`, y: `-=${rise * 0.55}`, rotation: -12, ease: "sine.out" },
          { x: `+=${run * 0.6}`, y: `-=${rise * 0.45}`, rotation: 14, opacity: 0, ease: "sine.in" },
        ],
        duration: 1.6 + Math.random() * 0.6,
        onComplete: () => n.remove(),
      });
    }, (i / stream) * duration * 0.85);
  }

  // Four notes fly to the menu and become the links.
  const items = [...document.querySelectorAll(".note-nav a")];
  const flyAt = duration * 0.5;
  items.forEach((a, i) => {
    const glyph = a.querySelector(".glyph");
    tl.add(() => {
      const { x, y } = from();
      const n = spawnNote(layer, x, y);
      const to = center(glyph);
      const mid = { x: (x + to.x) / 2 + 60, y: Math.min(y, to.y) - 140 - i * 30 };
      gsap.to(n, {
        keyframes: [
          { x: mid.x - 9, y: mid.y - 12, rotation: -20, ease: "sine.out" },
          { x: to.x - 9, y: to.y - 12, rotation: 0, ease: "sine.inOut" },
        ],
        duration: 1.3,
        onComplete: () => {
          n.remove();
          gsap.set(glyph, { opacity: 1 });
          gsap.fromTo(a.querySelector(".txt"), { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" });
        },
      });
    }, flyAt + i * 0.22);
  });

  // Meanwhile the stage lifts: black eases to charcoal, he steps back to his spot, the name comes up.
  const settle = flyAt - 0.2;
  tl.to(intro.querySelectorAll(".spot, .floor, .click-me, .skip"), { opacity: 0, duration: 0.6 }, settle)
    .to(intro, { backgroundColor: "rgba(0,0,0,0)", duration: 1.2, ease: "sine.inOut" }, settle)
    .add(() => {
      const a = figure.getBoundingClientRect();
      const b = slot.getBoundingClientRect();
      gsap.to(figure, {
        x: `+=${b.left + b.width / 2 - (a.left + a.width / 2)}`,
        y: `+=${b.bottom - a.bottom}`,
        scale: b.height / a.height,
        transformOrigin: "50% 100%",
        duration: 1.1,
        ease: "power3.inOut",
      });
    }, settle)
    .to(".site-header", { opacity: 1, duration: 0.6 }, settle + 0.6)
    .fromTo(".reveal-in", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power2.out" }, settle + 0.3);

  tl.to({}, { duration: 1.5 }); // let the last notes land
  return tl.then();
}
