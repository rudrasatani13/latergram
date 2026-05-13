export function Grain() {
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>
      <filter id='n'>
        <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
        <feColorMatrix values='0 0 0 0 0.17 0 0 0 0 0.14 0 0 0 0 0.12 0 0 0 0.55 0'/>
      </filter>
      <rect width='100%' height='100%' filter='url(%23n)'/>
    </svg>`;
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5] mix-blend-multiply opacity-[0.06]"
      style={{ backgroundImage: url, backgroundSize: "220px 220px" }}
    />
  );
}
