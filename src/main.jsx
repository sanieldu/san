// Mounts the interactive pieces onto the static pages. Without JS or WebGL the pages still read fine.
import { createRoot } from "react-dom/client";
import { lazy, Suspense } from "react";
import { Glass, TabBar } from "glisse";

const Kit = lazy(() => import("./Kit.jsx"));
const Haze = lazy(() => import("./Haze.jsx"));
const hasWebGL = !!document.createElement("canvas").getContext("webgl2");
const mount = (el, node) => el && createRoot(el).render(<Suspense>{node}</Suspense>);

// The nav links in the HTML stay the source of truth; the glass tab bar is built from them.
const nav = document.querySelector("header nav");
const links = [...nav.querySelectorAll("a")].map((a) => ({ value: a.getAttribute("href"), label: a.textContent, href: a.getAttribute("href") }));
const current = nav.querySelector("[aria-current]")?.getAttribute("href") ?? null;
mount(nav, <TabBar items={links} defaultValue={current} aria-label="main" />);

// A refracting glass pane behind each project card.
document.querySelectorAll(".chart").forEach((card) => {
  const pane = card.insertBefore(document.createElement("div"), card.firstChild);
  pane.className = "glass-pane";
  mount(pane, <Glass style={{ position: "absolute", inset: 0, borderRadius: "inherit" }} />);
});

if (hasWebGL) {
  mount(document.getElementById("kit"), <Kit />);
  mount(document.getElementById("haze"), <Haze />);
}
