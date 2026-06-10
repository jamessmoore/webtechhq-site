interface HexMarkProps {
  size?: number
  className?: string
}

export default function HexMark({ size = 39, className = '' }: HexMarkProps) {
  // All coordinates are proportional to a 38×39 viewBox
  return (
    <svg
      width={size}
      height={Math.round(size * 39 / 38)}
      viewBox="0 0 38 39"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`hex-mark ${className}`}
      aria-hidden="true"
    >
      {/* Outer hex */}
      <polygon
        points="19,0 36,10 36,29 19,39 2,29 2,10"
        fill="#071830"
        stroke="#3D7FD4"
        strokeWidth="1.5"
      />
      {/* Inner ring */}
      <polygon
        points="19,5 31,12 31,27 19,34 7,27 7,12"
        fill="none"
        stroke="#1A3D7A"
        strokeWidth="0.6"
      />
      {/* M letterform */}
      <path
        d="M10 32 L10 10 L19 19 L28 10 L28 32"
        stroke="#89D4FF"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* Base rule — anvil echo */}
      <line x1="6" y1="27" x2="32" y2="27" stroke="#2D5A9E" strokeWidth="1" />
      {/* Vertex nodes */}
      <circle cx="10" cy="10" r="2" fill="#071830" stroke="#89D4FF" strokeWidth="1" />
      <circle cx="28" cy="10" r="2" fill="#071830" stroke="#89D4FF" strokeWidth="1" />
      <circle cx="19" cy="19" r="2.5" fill="#3D7FD4" />
      <circle cx="19" cy="0"  r="2" fill="#89D4FF" />
    </svg>
  )
}
