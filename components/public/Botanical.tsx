/**
 * Botanical line-art motifs — the brand's recurring signature.
 * Stroke uses `currentColor`, so tint with a text color utility
 * (e.g. `text-primary/10`). Decorative only: aria-hidden.
 */

type Variant = "bloom" | "sprig" | "stem";

export default function Botanical({
  variant = "bloom",
  className = "",
  strokeWidth = 1.25,
}: {
  variant?: Variant;
  className?: string;
  strokeWidth?: number;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {variant === "bloom" && (
        <g {...common}>
          {/* five-petal flower */}
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx="60"
              cy="34"
              rx="13"
              ry="26"
              transform={`rotate(${a} 60 60)`}
            />
          ))}
          <circle cx="60" cy="60" r="7" />
          <path d="M60 67 C60 84 60 96 60 112" />
          <path d="M60 90 C50 86 44 80 42 70" />
          <path d="M60 98 C70 94 76 88 78 78" />
        </g>
      )}
      {variant === "sprig" && (
        <g {...common}>
          <path d="M60 112 C60 80 60 40 60 12" />
          {[26, 44, 62, 80].map((y, i) => (
            <g key={y}>
              <path d={`M60 ${y} C${44 - i * 1} ${y - 6} ${36} ${y - 14} ${30} ${y - 22}`} />
              <path d={`M60 ${y + 8} C${76 + i} ${y + 2} ${84} ${y - 6} ${90} ${y - 14}`} />
            </g>
          ))}
        </g>
      )}
      {variant === "stem" && (
        <g {...common}>
          <path d="M20 110 C40 80 50 50 60 14" />
          <ellipse cx="60" cy="14" rx="6" ry="11" />
          <path d="M44 60 C34 56 28 48 27 38" />
          <path d="M52 38 C44 34 40 27 40 18" />
          <path d="M40 86 C30 82 24 74 23 64" />
        </g>
      )}
    </svg>
  );
}
