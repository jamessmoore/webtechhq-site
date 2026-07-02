interface ToolPlaceholderCardProps {
  glyph: string;
  name: string;
  desc: string;
}

export default function ToolPlaceholderCard({ glyph, name, desc }: ToolPlaceholderCardProps) {
  return (
    <div
      className="relative"
      style={{ border: "0.8px dashed #162D5A", padding: 20, backgroundColor: "rgba(7,21,37,.5)" }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 40,
          height: 40,
          backgroundColor: "#0A1A2E",
          border: "0.8px solid #162D5A",
          color: "#5B90C8",
          marginBottom: 14,
          font: '400 16px "Courier New", monospace',
        }}
      >
        {glyph}
      </div>
      <div style={{ font: "700 14px Arial, sans-serif", color: "#80AEE0" }}>{name}</div>
      <p style={{ margin: "6px 0 0", font: "400 12.5px/1.55 Arial, sans-serif", color: "#5B7BA5" }}>{desc}</p>
      <span
        className="inline-block"
        style={{
          marginTop: 14,
          font: '400 9.5px "Courier New", monospace',
          letterSpacing: "0.14em",
          color: "#5B7BA5",
          border: "0.8px solid #162D5A",
          padding: "3px 8px",
        }}
      >
        COMING SOON
      </span>
    </div>
  );
}
