interface ReadinessBarsProps {
  bars: { label: string; pct: number }[];
}

export default function ReadinessBars({ bars }: ReadinessBarsProps) {
  return (
    <div
      className="relative card-accent flex flex-col gap-4"
      style={{ backgroundColor: "#071525", border: "0.8px solid #162D5A", padding: "24px 26px" }}
    >
      {bars.map((bar) => (
        <div key={bar.label}>
          <div className="flex justify-between gap-[10px]" style={{ marginBottom: 7 }}>
            <span style={{ font: "400 13px Arial, sans-serif", color: "#EEF6FF" }}>{bar.label}</span>
            <span style={{ font: '400 12px "Courier New", monospace', color: "#5B7BA5" }}>{bar.pct}%</span>
          </div>
          <div style={{ height: 7, backgroundColor: "#0A1A2E", border: "0.8px solid #162D5A", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${bar.pct}%`, backgroundColor: "#3D7FD4" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
