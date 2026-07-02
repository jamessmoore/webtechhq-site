interface KpiTilesProps {
  kpis: { v: string; u: string }[];
}

export default function KpiTiles({ kpis }: KpiTilesProps) {
  return (
    <div className="grid gap-3" style={{ marginTop: 26, gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
      {kpis.map((kpi) => (
        <div
          key={kpi.u}
          className="relative card-accent"
          style={{ backgroundColor: "#071525", border: "0.8px solid #162D5A", padding: "18px 20px" }}
        >
          <div style={{ font: '700 clamp(22px,5vw,26px) "Courier New", monospace', color: "#89D4FF" }}>{kpi.v}</div>
          <div style={{ font: "400 12.5px/1.45 Arial, sans-serif", color: "#80AEE0", marginTop: 6 }}>{kpi.u}</div>
        </div>
      ))}
    </div>
  );
}
