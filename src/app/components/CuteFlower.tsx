interface CuteFlowerProps {
  size?: number;
  color?: "rose" | "lavender" | "butter" | "sage" | "blush";
  className?: string;
}

const colors = {
  rose: { petal: "#F3B8BF", center: "#F7D978", stroke: "#E89BA4" },
  lavender: { petal: "#C9B7E8", center: "#F7D978", stroke: "#B79FE0" },
  butter: { petal: "#F7D978", center: "#F3B8BF", stroke: "#E9C649" },
  sage: { petal: "#A9C9A4", center: "#F7D978", stroke: "#8AB18A" },
  blush: { petal: "#FBE3DF", center: "#F3B8BF", stroke: "#F3B8BF" },
};

export function CuteFlower({ size = 32, color = "rose", className = "" }: CuteFlowerProps) {
  const c = colors[color];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="20"
          cy="10"
          rx="6.5"
          ry="9"
          fill={c.petal}
          stroke={c.stroke}
          strokeWidth="0.6"
          transform={`rotate(${angle} 20 20)`}
          opacity="0.92"
        />
      ))}
      <circle cx="20" cy="20" r="4.5" fill={c.center} stroke={c.stroke} strokeWidth="0.6" />
      <circle cx="18.5" cy="18.5" r="1" fill="#fff" opacity="0.7" />
    </svg>
  );
}
