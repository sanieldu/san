// A stylised dachshund puppy head in a Santa hat, built from three.js primitives (no model file to download).
import {
  ACESFilmicToneMapping, Color, ConeGeometry, DirectionalLight, Group, HemisphereLight, Mesh,
  MeshPhysicalMaterial, MeshStandardMaterial, PerspectiveCamera, Scene, SphereGeometry, SRGBColorSpace,
  TorusGeometry, WebGLRenderer,
} from "three";

const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mat = (color, roughness = 0.75) => new MeshStandardMaterial({ color, roughness });
const CHOC = mat("#5a2f17"), EAR = mat("#47240f"), TAN = mat("#c98545"), WHITE = mat("#f3efe8", 1), RED = mat("#b3242b", 0.6);
const GLOSS = new MeshPhysicalMaterial({ color: "#120a06", roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05 });
const SHINE = new MeshStandardMaterial({ color: "#ffffff", emissive: new Color("#ffffff"), emissiveIntensity: 0.6 });
const sphere = new SphereGeometry(1, 40, 28);

// An ellipsoid: a unit sphere scaled per axis.
function blob(material, [x, y, z], [sx, sy, sz], parent) {
  const m = new Mesh(sphere, material);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  parent.add(m);
  return m;
}

export function buildDoxie() {
  const head = new Group();
  blob(CHOC, [0, 0.1, 0], [0.6, 0.55, 0.52], head);              // skull
  blob(CHOC, [0, -0.1, 0.16], [0.5, 0.34, 0.38], head);          // cheeks
  blob(TAN, [0, -0.17, 0.5], [0.28, 0.21, 0.36], head);          // muzzle, long like a doxie's
  blob(TAN, [0, -0.3, 0.36], [0.22, 0.13, 0.26], head);          // chin
  blob(GLOSS, [0, -0.08, 0.84], [0.12, 0.09, 0.09], head);       // nose
  for (const s of [-1, 1]) {
    blob(GLOSS, [s * 0.24, 0.1, 0.4], [0.12, 0.13, 0.1], head);  // big dark eyes
    blob(SHINE, [s * 0.24 - 0.035, 0.15, 0.49], [0.025, 0.025, 0.02], head);
    blob(TAN, [s * 0.24, 0.3, 0.38], [0.065, 0.04, 0.04], head); // eyebrow spots
  }
  // Long floppy ears hang from pivots at the top of the head so they can sway.
  const ears = [-1, 1].map((s) => {
    const pivot = new Group();
    pivot.position.set(s * 0.46, 0.28, -0.02);
    blob(EAR, [s * 0.1, -0.5, 0], [0.15, 0.55, 0.3], pivot);
    head.add(pivot);
    return pivot;
  });
  // Santa hat: tilted cone with a drooping tip, white brim and pom-pom.
  const hat = new Group();
  hat.position.set(0.05, 0.48, -0.02);
  hat.rotation.z = -0.25;
  const cone = new Mesh(new ConeGeometry(0.44, 0.62, 40), RED);
  cone.position.y = 0.3;
  hat.add(cone);
  const tip = new Mesh(new ConeGeometry(0.13, 0.38, 24), RED);
  tip.position.set(0.16, 0.62, 0);
  tip.rotation.z = -1.1;
  hat.add(tip);
  blob(WHITE, [0.34, 0.66, 0], [0.11, 0.11, 0.11], hat);
  const brim = new Mesh(new TorusGeometry(0.44, 0.09, 16, 48), WHITE);
  brim.rotation.x = Math.PI / 2;
  hat.add(brim);
  head.add(hat);
  return { head, ears };
}

export function mountDoxie(container) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  container.append(renderer.domElement);

  const scene = new Scene();
  scene.add(new HemisphereLight("#fff6ea", "#3a2a20", 1.4));
  const key = new DirectionalLight("#ffffff", 2.2);
  key.position.set(-1.5, 2, 3);
  const rim = new DirectionalLight("#ffe7c4", 1.2);
  rim.position.set(2, 1, -2);
  scene.add(key, rim);

  const camera = new PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0, 0.25, 4.4);
  camera.lookAt(0, 0.2, 0);
  const { head, ears } = buildDoxie();
  scene.add(head);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(container);
  resize();

  const draw = (t) => {
    head.position.y = Math.sin(t * 2.4) * 0.05;
    head.rotation.y = Math.sin(t * 0.8) * 0.18;
    head.rotation.z = Math.sin(t * 1.2) * 0.05;
    ears.forEach((ear, i) => (ear.rotation.z = (i ? -1 : 1) * (0.06 + Math.cos(t * 2.4 - 0.6) * 0.07)));
    renderer.render(scene, camera);
  };
  if (still) draw(0.6);
  else renderer.setAnimationLoop((ms) => draw(ms / 1000));
  return renderer;
}
