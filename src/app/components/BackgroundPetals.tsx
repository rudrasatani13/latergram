import { blooms, decor } from "./BrandAssets";

const items = [
  { src: blooms.softPeony,     top: "38%",  left: "-5%",  size: 200, rot: 18,  op: 0.45 },
  { src: blooms.sunflower,     top: "55%",  right: "-4%", size: 170, rot: -10, op: 0.45 },
  { src: blooms.coralCarnation,bottom: "10%",left: "6%",  size: 140, rot: 8,   op: 0.4 },
  { src: blooms.apricotRose,   bottom: "-3%",right: "12%",size: 200, rot: -16, op: 0.5 },
  { src: decor.pastelStarSparkles, top: "70%", left: "30%", size: 70, rot: 12, op: 0.6 },
  { src: decor.envelopeMini,   bottom: "22%",left: "48%", size: 64,  rot: -4,  op: 0.55 },
];

export function BackgroundPetals() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {items.map((it, i) => (
        <img
          key={i}
          src={it.src}
          alt=""
          style={{
            position: "absolute",
            top: it.top,
            left: it.left,
            right: it.right,
            bottom: it.bottom,
            width: it.size,
            height: it.size,
            transform: `rotate(${it.rot}deg)`,
            opacity: it.op,
            objectFit: "contain",
            filter: "saturate(0.95)",
          }}
        />
      ))}
    </div>
  );
}
