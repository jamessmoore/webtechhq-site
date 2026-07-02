interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const base = (size: number, strokeWidth: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function GridIcon({ size = 17, className, style }: IconProps) {
  return (
    <svg {...base(size, 1.7)} className={className} style={style}>
      <rect x="3.5" y="3.5" width="7" height="7" />
      <rect x="13.5" y="3.5" width="7" height="7" />
      <rect x="3.5" y="13.5" width="7" height="7" />
      <rect x="13.5" y="13.5" width="7" height="7" />
    </svg>
  );
}

export function SparkleIcon({ size = 17, className, style }: IconProps) {
  return (
    <svg {...base(size, 1.5)} className={className} style={style}>
      <path d="M12 3l1.9 4.7L18.6 9l-4.7 1.3L12 15l-1.9-4.7L5.4 9l4.7-1.3z" />
      <path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </svg>
  );
}

export function ClockIcon({ size = 15, className, style }: IconProps) {
  return (
    <svg {...base(size, 1.7)} className={className} style={style}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function CheckIcon({ size = 14, className, style }: IconProps) {
  return (
    <svg {...base(size, 3.2)} className={className} style={style}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ChevronIcon({
  size = 17,
  className,
  style,
  open = false,
}: IconProps & { open?: boolean }) {
  return (
    <svg
      {...base(size, 2)}
      className={className}
      style={{
        transition: "transform .2s ease",
        transform: `rotate(${open ? 180 : 0}deg)`,
        ...style,
      }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg {...base(size, 2)} className={className} style={style}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function CalendarIcon({ size = 17, className, style }: IconProps) {
  return (
    <svg {...base(size, 1.9)} className={className} style={style}>
      <rect x="3" y="4.5" width="18" height="17" rx="1" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </svg>
  );
}

export function ShieldIcon({ size = 13, className, style }: IconProps) {
  return (
    <svg {...base(size, 1.7)} className={className} style={style}>
      <path d="M12 2 4 6v6c0 5 3.4 7.6 8 10 4.6-2.4 8-5 8-10V6z" />
    </svg>
  );
}

export function HelpCircleIcon({ size = 14, className, style }: IconProps) {
  return (
    <svg {...base(size, 1.7)} className={className} style={style}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.7-2.5 2-2.5 3.5" />
      <path d="M12 17.5h.01" />
    </svg>
  );
}

export function MenuIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg {...base(size, 1.7)} className={className} style={style}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function CloseIcon({ size = 18, className, style }: IconProps) {
  return (
    <svg {...base(size, 1.7)} className={className} style={style}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function CopyIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg {...base(size, 1.7)} className={className} style={style}>
      <rect x="9" y="9" width="12" height="12" rx="1.5" />
      <path d="M6 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V6" />
    </svg>
  );
}

export function SignOutIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg {...base(size, 1.7)} className={className} style={style}>
      <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
