import "./home.css";
import { gsap } from "gsap";
import { store, soundOn, reducedMotion } from "./site.js";
import { reveal } from "./reveal.js";

// Bump the version to show the intro again to everyone (e.g. after changing the lick or the walk-on).
const FLAG = "dsu-intro-v1";
const root = document.documentElement;
const slot = document.getElementById("figure-slot");
const svg = slot.querySelector(".trumpeter");
const intro = document.getElementById("intro");
const stageFigure = document.getElementById("stage-figure");
const playBtn = document.getElementById("play");
const layer = document.querySelector(".notes");
const part = (sel) => svg.querySelector(sel);

// --- home controls ---
const soundBtn = document.getElementById("sound");
const paintSound = () => {
  soundBtn.textContent = soundOn() ? "sound on" : "sound off";
  soundBtn.setAttribute("aria-pressed", soundOn());
};
soundBtn.addEventListener("click", () => { store.set("dsu-sound", soundOn() ? "off" : "on"); paintSound(); });
paintSound();
document.getElementById("replay").addEventListener("click", () => { location.href = "/?intro"; });

function finish() {
  gsap.globalTimeline.getChildren().forEach((t) => t.kill());
  layer.replaceChildren();
  gsap.set([svg, ...svg.querySelectorAll("g")], { clearProps: "all" });
  slot.append(svg);
  intro.remove();
  root.classList.remove("intro-on");
  gsap.set(".reveal-in, .site-header, .note-nav .glyph, .note-nav .txt", { clearProps: "opacity,transform" });
  store.set(FLAG, "1");
}

if (root.classList.contains("intro-on")) runIntro();
if (location.search.includes("intro")) history.replaceState(null, "", "/");

function runIntro() {
  intro.hidden = false;
  stageFigure.append(svg);
  gsap.set(stageFigure, { xPercent: -50 });

  // Preload during the walk-on: the lick and the fonts.
  const audio = new Audio("/audio/lick.mp3");
  audio.preload = "auto";
  const audioReady = new Promise((done) => {
    audio.addEventListener("canplaythrough", done, { once: true });
    audio.addEventListener("error", done, { once: true });
  });
  const ready = Promise.race([Promise.all([audioReady, document.fonts.ready]), new Promise((r) => setTimeout(r, 1500))]);

  let done = false;
  const end = () => { if (!done) { done = true; audio.pause(); finish(); } };
  document.getElementById("skip").addEventListener("click", end);

  // Walk-on: about 2.2s in from the left, then he raises the horn.
  const lowered = 68;
  const svgOrigin = { legs: "96 158", arms: "100 88" };
  gsap.set(svg.querySelectorAll(".horn, .arm.back"), { rotation: lowered, svgOrigin: svgOrigin.arms });
  gsap.set(svg.querySelectorAll(".leg"), { svgOrigin: svgOrigin.legs });
  const walk = 2.2, steps = 6;
  const tl = gsap.timeline();
  tl.to(".intro .spot", { opacity: 1, duration: 0.8, ease: "sine.out" })
    .to(".intro .floor", { opacity: 1, duration: 0.8 }, "<")
    .fromTo(stageFigure, { x: () => -(innerWidth / 2 + stageFigure.offsetWidth) }, { x: 0, duration: walk, ease: "sine.out" }, 0.1)
    .fromTo(part(".leg.front"), { rotation: -22 }, { rotation: 22, duration: walk / steps, repeat: steps - 1, yoyo: true, ease: "sine.inOut" }, 0.1)
    .fromTo(part(".leg.back"), { rotation: 22 }, { rotation: -22, duration: walk / steps, repeat: steps - 1, yoyo: true, ease: "sine.inOut" }, 0.1)
    .fromTo(svg.querySelectorAll(".horn, .arm.back"), { rotation: lowered - 6 }, { rotation: lowered + 6, duration: walk / steps, repeat: steps - 1, yoyo: true, ease: "sine.inOut" }, 0.1)
    .fromTo(svg, { y: 0 }, { y: -3, duration: walk / steps / 2, repeat: steps * 2 - 1, yoyo: true, ease: "sine.inOut" }, 0.1)
    .to(svg.querySelectorAll(".leg"), { rotation: 0, duration: 0.25, ease: "sine.out" })
    .to(svg.querySelectorAll(".horn, .arm.back"), { rotation: 0, duration: 0.5, ease: "back.out(1.6)" }, "-=0.05")
    .to(svg.querySelector(".body"), { rotation: -4, svgOrigin: "96 160", duration: 0.5, ease: "sine.out" }, "<");

  Promise.all([tl.then(), ready]).then(() => {
    if (done) return;
    playBtn.hidden = false;
    gsap.from(playBtn, { opacity: 0, duration: 0.5 });
    playBtn.focus({ preventScroll: true });
  });

  playBtn.addEventListener("click", async () => {
    playBtn.disabled = true;
    playBtn.style.animation = "none"; // the CSS pulse would override the fade
    gsap.to(playBtn, { opacity: 0, duration: 0.3 });
    let duration = 2.8; // when sound is off or the clip is missing
    if (soundOn()) {
      try {
        await audio.play();
        if (Number.isFinite(audio.duration)) duration = audio.duration;
      } catch {}
    }
    // He leans into the phrase while the notes come out.
    gsap.to(svg.querySelectorAll(".horn, .arm.back, .body"), { rotation: "-=5", duration: duration / 4, yoyo: true, repeat: 3, ease: "sine.inOut" });
    await reveal({ intro, figure: stageFigure, slot, bell: part(".bell"), layer, duration });
    end();
  }, { once: true });
}
