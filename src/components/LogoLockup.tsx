interface LogoLockupProps {
  height?: number
  className?: string
}

export default function LogoLockup({ height = 40, className = '' }: LogoLockupProps) {
  const width = Math.round((height * 520) / 110)

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 520 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`logo-lockup ${className}`}
      role="img"
      aria-label="Moore Solutions"
    >
      <g transform="translate(20, 15)">
        <polygon
          points="46,0 88,24 88,72 46,96 4,72 4,24"
          fill="#071830"
          stroke="#3D7FD4"
          strokeWidth="3"
        />
        <polygon
          points="46,12 76,29 76,67 46,84 16,67 16,29"
          fill="none"
          stroke="#1A3D7A"
          strokeWidth="1.5"
        />
        <path
          d="M24 78 L24 24 L46 46 L68 24 L68 78"
          fill="none"
          stroke="#89D4FF"
          strokeWidth="6"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <line x1="12" y1="66" x2="80" y2="66" stroke="#2D5A9E" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="5" fill="#071830" stroke="#89D4FF" strokeWidth="2.5" />
        <circle cx="68" cy="24" r="5" fill="#071830" stroke="#89D4FF" strokeWidth="2.5" />
        <circle cx="46" cy="46" r="6" fill="#3D7FD4" />
        <circle cx="46" cy="0" r="5" fill="#89D4FF" />
      </g>
      <line x1="130" y1="10" x2="130" y2="100" stroke="#1A3D7A" strokeWidth="1" />
      <text
        x="148"
        y="57"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="52"
        letterSpacing="10"
        fill="#EEF6FF"
      >
        MOORE
      </text>
      <line x1="148" y1="63" x2="500" y2="63" stroke="#1A3D7A" strokeWidth="0.8" />
      <text
        x="148"
        y="91"
        fontFamily="'Courier New', Courier, monospace"
        fontSize="33"
        letterSpacing="7"
        fill="#A9CFFA"
      >
        SOLUTIONS
      </text>
    </svg>
  )
}
