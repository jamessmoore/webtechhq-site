const credentials = [
  'ANTHROPIC CLAUDE',
  'AMAZON BEDROCK',
  'MCP BUILDER',
  '48 PUBLIC REPOS',
]

export default function ProofBar() {
  return (
    <div
      className="py-3 px-6 flex flex-wrap items-center gap-x-4 gap-y-2"
      style={{
        backgroundColor: '#020810',
        borderTop: '0.5px solid #0D1E3A',
        borderBottom: '0.5px solid #0D1E3A',
      }}
    >
      <span
        className="font-mono text-[8px] tracking-[0.2em]"
        style={{ color: '#162D5A' }}
      >
        CERTIFIED:
      </span>
      {credentials.map((c, i) => (
        <span key={c} className="flex items-center gap-4">
          {i > 0 && (
            <span style={{ color: '#0D1E3A', fontFamily: 'monospace', fontSize: '8px' }}>·</span>
          )}
          <span
            className="font-mono text-[8px] tracking-widest"
            style={{ color: '#1A3D7A' }}
          >
            {c}
          </span>
        </span>
      ))}
    </div>
  )
}
