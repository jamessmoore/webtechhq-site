import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const projects = [
  {
    id: 'aws-audit-mcp',
    title: 'AWS AUDIT MCP SERVER',
    content:
      'A custom Model Context Protocol server that audits AWS EC2 infrastructure for security and compliance issues — flagging untagged instances, public IP exposure, and overly permissive security groups — then generates client-ready reports in Markdown, HTML, or PDF.',
    href: 'https://github.com/jamessmoore/aws-audit-mcp',
  },
  {
    id: 'daily-tech-brief',
    title: 'DAILY TECH BRIEF AGENT',
    content:
      'An autonomous Claude Code agent that runs nightly via cron, researches the latest news in DevOps, AI agents, MCP, and cloud infrastructure using a scoped subagent, and posts a structured summary straight to Slack through a custom MCP server.',
    href: 'https://github.com/jamessmoore/daily-tech-brief',
  },
  {
    id: 'webtechhq-site',
    title: 'MOORE SOLUTIONS WEBSITE',
    content:
      'This site — built with Next.js 16, React 19, and Tailwind CSS, featuring a custom dark design system, a server-action contact form with Gmail SMTP and reCAPTCHA, and a fully agentic build process using Claude Code.',
    href: 'https://github.com/jamessmoore/webtechhq-site',
  },
]

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[58px]" style={{ backgroundColor: '#040C1C' }}>
        {/* Page header */}
        <section className="px-10 pt-8 pb-12">
          <div className="max-w-3xl mx-auto">
            <span className="font-mono font-bold tracking-[0.3em]" style={{ fontSize: '1.75em', color: '#071830' }}>
              PORTFOLIO
            </span>
            <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '80px', marginTop: '4px', marginBottom: '24px' }} />
            <h1 className="font-sans font-black leading-tight mb-4" style={{ fontSize: '2rem', color: '#EEF6FF' }}>
              Recent builds, open for review.
            </h1>
            <p className="font-mono text-[15px] leading-relaxed" style={{ color: '#3D7FD4' }}>
              A sample of recent projects — AI agents, MCP servers, and the site you&apos;re
              looking at right now. Every repo below is public; clone it, read the code, and
              judge for yourself.
            </p>
          </div>
        </section>

        {/* Project sections */}
        {projects.map((p) => (
          <section
            key={p.id}
            className="px-10 py-[15px]"
            style={{ borderTop: '0.5px solid #162D5A' }}
          >
            <div className="max-w-3xl mx-auto">
              <h2
                className="font-mono font-bold text-[24px] tracking-widest mb-4"
                style={{ color: '#89D4FF' }}
              >
                {p.title}
              </h2>
              <p
                className="font-mono text-[15px] leading-relaxed mb-4"
                style={{ color: '#3D7FD4' }}
              >
                {p.content}
              </p>
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-mono text-[10px] tracking-widest px-5 py-2 transition-colors duration-150"
                style={{ backgroundColor: '#0E3A9A', border: '1px solid #3D7FD4', color: '#89D4FF', borderRadius: '2px' }}
              >
                VIEW ON GITHUB ›
              </a>
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  )
}
