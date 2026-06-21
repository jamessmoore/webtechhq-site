import HexMark from './HexMark'

const credentials = [
  'ANTHROPIC CLAUDE',
  'AMAZON BEDROCK',
  'MCP BUILDER',
  '48 PUBLIC REPOS',
]

export default function ProofBar() {
  return (
    <div
      className="py-3 px-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
      style={{
        backgroundColor: '#020810',
        borderTop: '0.5px solid #0D1E3A',
        borderBottom: '0.5px solid #0D1E3A',
      }}
    >
      <span
        className="font-sans text-[11px] tracking-[0.2em]"
        style={{ color: '#A9CFFA' }}
      >
        CERTIFIED:
      </span>
      {credentials.map((c, i) => (
        <span key={c} className="flex items-center gap-4">
          {i > 0 && <HexMark size={11} />}
          <span
            className="font-sans text-[11px] tracking-widest"
            style={{ color: '#A9CFFA' }}
          >
            {c}
          </span>
        </span>
      ))}
    </div>
  )
}
