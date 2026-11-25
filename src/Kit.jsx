// The home page drum kit: one spotlight, haze in the beam, and every piece plays when you hit it.
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Sparkles, SpotLight } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { CanvasTexture, DoubleSide, SRGBColorSpace, Vector3 } from "three";

const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const chrome = <meshStandardMaterial color="#d8d2c4" metalness={1} roughness={0.22} />;
const lacquer = <meshStandardMaterial color="#1c0f07" metalness={0.3} roughness={0.15} side={DoubleSide} />;
const head = <meshStandardMaterial color="#e6dcc6" roughness={0.75} side={DoubleSide} />;

// [tone Hz, tone decay s, noise decay s]: enough to tell the pieces apart, no samples to download.
const SOUNDS = { kick: [55, 0.5, 0], tom: [150, 0.35, 0], floor: [95, 0.45, 0], snare: [190, 0.18, 0.22], hat: [0, 0, 0.09], cymbal: [0, 0, 1.4] };
let audio;
function play(kind) {
  const [hz, decay, noise] = SOUNDS[kind];
  audio ??= new AudioContext();
  const t = audio.currentTime;
  const out = (node, len, vol) => {
    const g = audio.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + len);
    node.connect(g).connect(audio.destination);
  };
  if (hz) {
    const o = audio.createOscillator();
    o.frequency.setValueAtTime(hz * 2, t);
    o.frequency.exponentialRampToValueAtTime(hz, t + 0.06);
    out(o, decay, 0.7);
    o.start(t);
    o.stop(t + decay);
  }
  if (noise) {
    const buf = audio.createBuffer(1, Math.ceil(audio.sampleRate * noise), audio.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = audio.createBufferSource();
    const hp = audio.createBiquadFilter();
    src.buffer = buf;
    hp.type = "highpass";
    hp.frequency.value = hz ? 1500 : 6000;
    src.connect(hp);
    out(hp, noise, hz ? 0.45 : 0.2);
    src.start(t);
  }
}

// A piece of the kit that reacts to a hit: cymbals wobble, drums pulse.
function Piece({ kind, children, ...props }) {
  const ref = useRef();
  const hitAt = useRef(-10);
  const base = useRef(null);
  const clock = useThree((s) => s.clock);
  useFrame(({ clock }) => {
    const g = ref.current;
    base.current ??= g.rotation.x;
    const dt = clock.elapsedTime - hitAt.current;
    const k = Math.exp(-dt * 5) * Math.sin(dt * 30);
    if (kind === "cymbal" || kind === "hat") g.rotation.x = base.current + 0.12 * k;
    else g.scale.setScalar(1 + 0.03 * k);
  });
  return (
    <group ref={ref} {...props}
      onPointerDown={(e) => { e.stopPropagation(); hitAt.current = clock.elapsedTime; play(kind); }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}>
      {children}
    </group>
  );
}

// A drum along its local Y axis. `logo` replaces the top head.
function Drum({ r, depth, logo }) {
  return (
    <>
      <mesh castShadow><cylinderGeometry args={[r, r, depth, 48, 1, true]} />{lacquer}</mesh>
      {[1, -1].map((s) => (
        <group key={s} position-y={(s * depth) / 2}>
          <mesh rotation-x={-Math.PI / 2}>
            <circleGeometry args={[r, 48]} />
            {s === 1 && logo ? <meshStandardMaterial map={logo} roughness={0.75} /> : head}
          </mesh>
          <mesh rotation-x={Math.PI / 2}><torusGeometry args={[r, 0.012, 8, 48]} />{chrome}</mesh>
        </group>
      ))}
    </>
  );
}

const Cymbal = ({ r }) => (
  <mesh castShadow><cylinderGeometry args={[0.03, r, 0.025, 64]} /><meshStandardMaterial color="#e3b04b" metalness={1} roughness={0.25} /></mesh>
);
const Stand = ({ x, z, h }) => (
  <group position={[x, 0, z]}>
    <mesh position-y={h / 2} castShadow><cylinderGeometry args={[0.01, 0.012, h, 8]} />{chrome}</mesh>
    <mesh position-y={0.01}><cylinderGeometry args={[0.14, 0.14, 0.01, 3]} /><meshStandardMaterial color="#2a2320" metalness={0.8} roughness={0.5} /></mesh>
  </group>
);

function useLogo() {
  const [tex, setTex] = useState(null);
  useEffect(() => {
    document.fonts.load("200px Anton").finally(() => {
      const c = Object.assign(document.createElement("canvas"), { width: 512, height: 512 });
      const g = c.getContext("2d");
      g.fillStyle = "#e6dcc6";
      g.fillRect(0, 0, 512, 512);
      g.fillStyle = "#0b0806";
      g.font = "190px Anton, Impact, sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("dsu", 256, 266);
      const t = new CanvasTexture(c);
      t.colorSpace = SRGBColorSpace;
      setTex(t);
    });
  }, []);
  return tex;
}

// Drifts the camera toward the pointer; backs off on narrow screens so the whole kit fits.
const target = new Vector3();
function Rig() {
  useFrame(({ camera, pointer, size }) => {
    const z = size.width < 700 ? 5.8 : 5.2;
    camera.position.lerp(target.set(pointer.x * 0.7, 1.45 + pointer.y * 0.25, z), still ? 1 : 0.04);
    camera.lookAt(0, size.width < 700 ? 0.8 : 0.62, 0);
  });
  return null;
}

export default function Kit() {
  const logo = useLogo();
  return (
    <Canvas shadows dpr={[1, 2]} frameloop={still ? "demand" : "always"} camera={{ position: [0, 1.45, 5.2], fov: 35 }}
      aria-label="A drum kit standing in a single spotlight. Tap a drum to play it." role="img">
      <fog attach="fog" args={["#0b0806", 5, 13]} />
      <ambientLight intensity={0.05} />
      <SpotLight position={[0, 5.5, 1.2]} angle={0.42} penumbra={0.55} distance={9} attenuation={6.5} anglePower={5}
        intensity={90} color="#f6c453" castShadow shadow-mapSize={[1024, 1024]} opacity={0.9} />
      <Environment resolution={64}>
        <Lightformer intensity={5} color="#f2c230" position={[0, 5, 1]} rotation-x={Math.PI / 2} scale={[4, 4, 1]} />
        <Lightformer intensity={4} color="#e8a93a" position={[0, 2, -5]} scale={[8, 3, 1]} />
        <Lightformer intensity={0.6} color="#8e1b1b" position={[-4, 1, -2]} rotation-y={Math.PI / 2} scale={[3, 2, 1]} />
      </Environment>
      {/* shadows only, so the name behind the kit stays visible */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial opacity={0.7} />
      </mesh>
      {!still && <Sparkles count={70} scale={[2.6, 4, 2.6]} position={[0, 2, 0.6]} size={2.2} speed={0.25} color="#f2c230" opacity={0.6} />}

      <Piece kind="kick" position={[0, 0.3, 0]} rotation-x={Math.PI / 2}><Drum r={0.3} depth={0.42} logo={logo} /></Piece>
      <Piece kind="tom" position={[-0.2, 0.78, -0.05]} rotation={[-0.35, 0, 0.12]}><Drum r={0.14} depth={0.14} /></Piece>
      <Piece kind="tom" position={[0.2, 0.78, -0.05]} rotation={[-0.35, 0, -0.12]}><Drum r={0.16} depth={0.15} /></Piece>
      <Piece kind="snare" position={[-0.58, 0.62, 0.22]} rotation-x={-0.12}><Drum r={0.18} depth={0.12} /></Piece>
      <Stand x={-0.58} z={0.22} h={0.55} />
      <Piece kind="floor" position={[0.62, 0.42, 0.2]}><Drum r={0.22} depth={0.36} /></Piece>
      <Stand x={-0.98} z={0.05} h={0.95} />
      <Piece kind="hat" position={[-0.98, 0.95, 0.05]}><Cymbal r={0.18} /><group position-y={-0.03}><Cymbal r={0.18} /></group></Piece>
      <Stand x={-0.55} z={-0.3} h={1.3} />
      <Piece kind="cymbal" position={[-0.55, 1.32, -0.3]} rotation={[0.25, 0, 0.15]}><Cymbal r={0.27} /></Piece>
      <Stand x={0.9} z={-0.15} h={1.15} />
      <Piece kind="cymbal" position={[0.9, 1.17, -0.15]} rotation={[0.2, 0, -0.18]}><Cymbal r={0.31} /></Piece>
      <Rig />
    </Canvas>
  );
}
