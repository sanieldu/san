import "./base.css";

// Remembered settings. Storage can throw (private mode, blocked cookies), so every access is guarded.
export const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} },
  remove(key) { try { localStorage.removeItem(key); } catch {} },
};
export const soundOn = () => store.get("dsu-sound") !== "off";
export const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

let audio;
export function boop() {
  if (!soundOn()) return;
  audio ??= new AudioContext();
  const t = audio.currentTime;
  [0, 0.11].forEach((at, i) => {
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(520 + i * 260, t + at);
    o.frequency.exponentialRampToValueAtTime(880 + i * 260, t + at + 0.08);
    g.gain.setValueAtTime(0.0001, t + at);
    g.gain.exponentialRampToValueAtTime(0.25, t + at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + at + 0.12);
    o.connect(g).connect(audio.destination);
    o.start(t + at);
    o.stop(t + at + 0.13);
  });
}

const hasWebGL = () => !!document.createElement("canvas").getContext("webgl2");

// Loads three.js and the dachshund only when someone first goes looking for him.
export async function liveDoxie(container) {
  if (!hasWebGL()) return null;
  const { mountDoxie } = await import("./doxie.js");
  container.querySelector("img")?.remove();
  return mountDoxie(container);
}

// The corner easter egg: mostly hidden, peeks up when the pointer comes near (or on a tap).
const egg = document.querySelector(".doxie");
if (egg && !document.body.dataset.noEgg) {
  egg.hidden = false;
  let live = null;
  const peek = (on) => {
    egg.classList.toggle("peek", on);
    if (on && !live) live = liveDoxie(egg);
  };
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    peek(innerWidth - e.clientX < 220 && innerHeight - e.clientY < 220);
  }, { passive: true });
  addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" && !egg.contains(e.target)) egg.classList.remove("peek");
  });
  egg.addEventListener("click", () => {
    if (!egg.classList.contains("peek")) return peek(true); // first tap on touch screens
    boop();
    egg.classList.remove("hop");
    void egg.offsetWidth;
    egg.classList.add("hop");
  });
}
