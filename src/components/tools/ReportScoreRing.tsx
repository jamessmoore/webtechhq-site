interface ReportScoreRingProps {
  score: number;
}

export default function ReportScoreRing({ score }: ReportScoreRingProps) {
  const deg = Math.round((score / 100) * 360);

  return (
    <div
      className="flex-none flex items-center justify-center"
      style={{
        width: 146,
        height: 146,
        borderRadius: "50%",
        background: `conic-gradient(#3D7FD4 0deg ${deg}deg, #0A1A2E ${deg}deg 360deg)`,
      }}
    >
      <div
        className="flex flex-col items-center justify-center"
        style={{ width: 116, height: 116, borderRadius: "50%", backgroundColor: "#030B18", border: "0.8px solid #162D5A" }}
      >
        <div style={{ font: '700 38px/1 "Courier New", monospace', color: "#EEF6FF" }}>{score}</div>
        <div style={{ font: '400 10px "Courier New", monospace', letterSpacing: "0.14em", color: "#5B7BA5", marginTop: 5 }}>
          / 100
        </div>
      </div>
    </div>
  );
}
