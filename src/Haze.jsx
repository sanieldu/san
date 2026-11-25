import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Stage haze behind the inner pages: tungsten amber drifting through smoke.
export default function Haze() {
  return (
    <ShaderGradientCanvas style={{ position: "absolute", inset: 0 }} pixelDensity={1}>
      <ShaderGradient
        type="waterPlane" animate={still ? "off" : "on"} uSpeed={0.08} uStrength={2.2} uDensity={1.1}
        color1="#c96f1f" color2="#3a1408" color3="#0b0806" brightness={1.1} grain="on"
        cDistance={4} cPolarAngle={90} cAzimuthAngle={180} lightType="3d"
      />
    </ShaderGradientCanvas>
  );
}
