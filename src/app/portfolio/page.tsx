import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HexMark from '@/components/HexMark'

const projects = [
  {
    id: 'coresample',
    title: 'CORESAMPLE: AWS AUDIT FRAMEWORK',
    content:
      'An AWS-native security and compliance audit framework built on Amazon Bedrock and MCP. The audit logic, the foundation-model invocation, and every AWS API call run entirely inside the account boundary; no external service ever reaches in to inspect your infrastructure. Read-only, per-service IAM roles scan EC2 for untagged instances, public IP exposure, and overly permissive security groups, then hand findings to a dedicated reporting MCP server for a client-ready report.',
    href: 'https://github.com/jamessmoore/CoreSample',
    variant: {
      label: 'VIEW AWS AUDIT MCP ›',
      href: 'https://github.com/jamessmoore/aws-audit-mcp',
    },
  },
  {
    id: 'daily-tech-brief',
    title: 'DAILY TECH BRIEF AGENT',
    content:
      'An autonomous Claude Code agent that runs nightly via cron, researches the latest news in DevOps, AI agents, MCP, and cloud infrastructure using a scoped subagent, and posts a structured summary straight to Slack through a custom MCP server. Also available as a Bedrock-native variant for teams standardized on AWS.',
    href: 'https://github.com/jamessmoore/daily-tech-brief',
    variant: {
      label: 'VIEW BEDROCK VARIANT ›',
      href: 'https://github.com/jamessmoore/daily-tech-brief-bedrock',
    },
  },
  {
    id: 'webtechhq-site',
    title: 'MOORE SOLUTIONS WEBSITE',
    content:
      'This site, built with Next.js 16, React 19, and Tailwind CSS, featuring a custom dark design system, a server-action contact form with Gmail SMTP and reCAPTCHA, and a fully agentic build process using Claude Code.',
    href: 'https://github.com/jamessmoore/webtechhq-site',
  },
  {
    id: 'webtechhq-infra',
    title: 'WEBTECHHQ INFRASTRUCTURE',
    content:
      'Terraform infrastructure for webtechhq.com: a single EC2 instance, Elastic IP, and security group provisioned as code, with user-data bootstrapping Node.js, PM2, Nginx, UFW, and fail2ban for production hardening.',
    href: 'https://github.com/jamessmoore/webtechhq-infra',
  },
  {
    id: 'iot-pipeline-demo',
    title: 'IOT TELEMETRY PIPELINE',
    content:
      'A full-stack IoT demo: ESP32 sensors monitoring an oil well tank, streaming over MQTT into OpenSearch, with a Next.js dashboard for visualization. A portfolio piece demonstrating the full path from sensor to dashboard.',
    href: 'https://github.com/jamessmoore/iot-pipeline-demo',
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
            <span className="font-sans font-bold tracking-[0.3em]" style={{ fontSize: '1.75em', color: '#1A3D7A' }}>
              PORTFOLIO
            </span>
            <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '80px', marginTop: '4px', marginBottom: '24px' }} />
            <h1 className="font-sans font-black leading-tight mb-4" style={{ fontSize: '2rem', color: '#EEF6FF' }}>
              Recent builds, open for review.
            </h1>
            <p className="font-sans text-[24px] leading-relaxed">
              A sample of recent projects: AI agents, MCP servers, and the site you&apos;re
              looking at right now. Every repo below is public; clone it, read the code, and
              judge for yourself.
            </p>
          </div>
        </section>

        {/* Project list */}
        <section className="px-10 py-[15px]" style={{ borderTop: '0.5px solid #162D5A' }}>
          <ul className="max-w-3xl mx-auto flex flex-col">
            {projects.map((p, i) => (
              <li
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6 py-6"
                style={i < projects.length - 1 ? { borderBottom: '0.5px solid #162D5A' } : undefined}
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="shrink-0">
                      <HexMark size={14} />
                    </span>
                    <h2
                      className="font-sans font-bold text-[21px] tracking-widest"
                      style={{ color: '#BCE5FF' }}
                    >
                      {p.title}
                    </h2>
                  </div>
                  <p className="font-sans text-[18px] leading-relaxed">
                    {p.content}
                  </p>
                </div>
                <div className="shrink-0 self-start sm:text-right flex flex-col gap-2">
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-[12px] tracking-widest transition-all duration-200 hover:text-[#89D4FF] hover:[text-shadow:0_0_6px_#89D4FF,0_0_14px_#3D9FFF] active:!text-white"
                    style={{ color: '#7EC8F4' }}
                  >
                    VIEW ON GITHUB ›
                  </a>
                  {p.variant && (
                    <a
                      href={p.variant.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-[12px] tracking-widest transition-all duration-200 hover:text-[#89D4FF] hover:[text-shadow:0_0_6px_#89D4FF,0_0_14px_#3D9FFF] active:!text-white"
                      style={{ color: '#5B90C8' }}
                    >
                      {p.variant.label}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  )
}
