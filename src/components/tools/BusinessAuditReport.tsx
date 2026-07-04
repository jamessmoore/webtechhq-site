"use client";

import { useState } from "react";
import type { AuditReport } from "@/lib/types";

function formatWholeDollars(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

const cardStyle: React.CSSProperties = {
  border: "0.8px solid #3D7FD4",
  backgroundColor: "#071525",
  borderRadius: 4,
  padding: "clamp(20px,3.5vw,28px)",
};

const kicker: React.CSSProperties = {
  font: '400 16px "Courier New", monospace',
  letterSpacing: "0.14em",
  color: "#5B7BA5",
  marginBottom: 6,
};

const heading: React.CSSProperties = {
  margin: 0,
  font: '400 clamp(22px,3vw,26px)/1.3 "Courier New", monospace',
  color: "#EEF6FF",
  letterSpacing: "0.01em",
};

const metricBoxStyle: React.CSSProperties = {
  border: "0.8px solid #162D5A",
  backgroundColor: "#0A1A2E",
  borderRadius: 3,
  padding: "10px 12px",
};

const metricLabel: React.CSSProperties = {
  font: '400 15px "Courier New", monospace',
  letterSpacing: "0.1em",
  color: "#5B7BA5",
  marginBottom: 4,
};

const metricValue: React.CSSProperties = {
  font: '700 17px "Courier New", monospace',
  color: "#89D4FF",
};

export default function BusinessAuditReport({ report }: { report: AuditReport }) {
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleEmailPdf() {
    if (emailState === "sending") return;
    setEmailState("sending");
    try {
      const res = await fetch("/api/tools/business-audit/email-pdf", { method: "POST" });
      if (!res.ok) throw new Error("send failed");
      setEmailState("sent");
    } catch {
      setEmailState("error");
    }
  }

  const recommended = report.opportunities.find((o) => o.rank === report.recommendedOpportunityRank);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden card-accent featured" style={cardStyle}>
        <span className="br-corner-tr" />
        <div style={kicker}>BUSINESS AUDIT</div>
        <h1 style={{ ...heading, font: '400 clamp(26px,4vw,32px)/1.3 "Courier New", monospace' }}>
          {report.businessName}
        </h1>
        <div className="grid gap-4" style={{ marginTop: 18, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
          <div>
            <div style={metricLabel}>BUSINESS OWNER</div>
            <div style={{ font: "400 18px Arial, sans-serif", color: "#EEF6FF" }}>{report.ownerFirstName}</div>
          </div>
          <div>
            <div style={metricLabel}>AUDIT DATE</div>
            <div style={{ font: "400 18px Arial, sans-serif", color: "#EEF6FF" }}>{report.auditDate}</div>
          </div>
          <div>
            <div style={metricLabel}>PREPARED BY</div>
            <div style={{ font: "400 18px Arial, sans-serif", color: "#EEF6FF" }}>James Moore, Moore Solutions</div>
          </div>
        </div>
        <p style={{ margin: "20px 0 0", font: "400 18px/1.7 Arial, sans-serif", maxWidth: 620 }}>
          {report.openingNote}
        </p>
        <p style={{ margin: "12px 0 0", font: "italic 400 14.5px/1.6 Arial, sans-serif", color: "#5B7BA5", maxWidth: 620 }}>
          These estimates are a realistic ballpark based on what you shared, not a guarantee. Actual
          results depend on adoption and a few details we confirm during implementation.
        </p>
      </div>

      {report.opportunities
        .slice()
        .sort((a, b) => a.rank - b.rank)
        .map((opp) => (
          <div key={opp.rank} className="relative overflow-hidden card-accent" style={cardStyle}>
            <span className="br-corner-tr" />
            <div style={kicker}>OPPORTUNITY {opp.rank}</div>
            <h2 style={heading}>{opp.title}</h2>

            <div style={{ marginTop: 16, marginBottom: 4, ...metricLabel }}>WHAT&apos;S HAPPENING NOW</div>
            <p style={{ margin: 0, font: "400 18px/1.7 Arial, sans-serif" }}>{opp.whatsHappeningNow}</p>

            <div style={{ marginTop: 16, marginBottom: 4, ...metricLabel }}>THE SOLUTION</div>
            <p style={{ margin: 0, font: "400 18px/1.7 Arial, sans-serif" }}>{opp.aiSolution}</p>

            <div className="grid gap-3" style={{ marginTop: 18, gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
              <div style={metricBoxStyle}>
                <div style={metricLabel}>SETUP FEE</div>
                <div style={metricValue}>{formatWholeDollars(opp.setupFeeCents)}</div>
              </div>
              <div style={metricBoxStyle}>
                <div style={metricLabel}>MONTHLY FEE</div>
                <div style={metricValue}>{formatWholeDollars(opp.monthlyFeeCents)}/mo</div>
              </div>
              <div style={metricBoxStyle}>
                <div style={metricLabel}>TIME SAVED</div>
                <div style={metricValue}>{opp.timeSavedLabel}</div>
              </div>
              <div style={metricBoxStyle}>
                <div style={metricLabel}>MONTHLY VALUE</div>
                <div style={metricValue}>{opp.monthlyValueLabel}</div>
              </div>
            </div>
          </div>
        ))}

      <div className="relative overflow-hidden card-accent" style={cardStyle}>
        <span className="br-corner-tr" />
        <div style={kicker}>SUMMARY &amp; BREAKDOWN</div>
        <h2 style={heading}>All Three Opportunities at a Glance</h2>
        <div className="overflow-x-auto" style={{ marginTop: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", font: "400 15px/1.5 Arial, sans-serif", minWidth: 520 }}>
            <thead>
              <tr style={{ borderBottom: "0.8px solid #162D5A" }}>
                {["OPPORTUNITY", "SETUP FEE", "MONTHLY FEE", "TIME SAVED", "MONTHLY VALUE"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", ...metricLabel }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.opportunities
                .slice()
                .sort((a, b) => a.rank - b.rank)
                .map((opp) => (
                  <tr key={opp.rank} style={{ borderBottom: "0.8px solid #0A1A2E" }}>
                    <td style={{ padding: "10px", color: "#EEF6FF", fontSize: 17 }}>
                      {opp.rank}. {opp.title}
                    </td>
                    <td style={{ padding: "10px", color: "#89D4FF" }}>{formatWholeDollars(opp.setupFeeCents)}</td>
                    <td style={{ padding: "10px", color: "#89D4FF" }}>{formatWholeDollars(opp.monthlyFeeCents)}/mo</td>
                    <td style={{ padding: "10px", color: "#89D4FF" }}>{opp.timeSavedLabel}</td>
                    <td style={{ padding: "10px", color: "#89D4FF" }}>{opp.monthlyValueLabel}</td>
                  </tr>
                ))}
              <tr>
                <td style={{ padding: "10px", font: "700 17px Arial, sans-serif", color: "#EEF6FF" }}>
                  Total, all three opportunities
                </td>
                <td style={{ padding: "10px", font: "700 17px Arial, sans-serif", color: "#EEF6FF" }}>
                  {formatWholeDollars(report.opportunities.reduce((sum, o) => sum + o.setupFeeCents, 0))}
                </td>
                <td style={{ padding: "10px", font: "700 17px Arial, sans-serif", color: "#EEF6FF" }}>
                  {formatWholeDollars(report.opportunities.reduce((sum, o) => sum + o.monthlyFeeCents, 0))}/mo
                </td>
                <td style={{ padding: "10px", font: "700 17px Arial, sans-serif", color: "#EEF6FF" }}>
                  {report.totalTimeSavedLabel}
                </td>
                <td style={{ padding: "10px", font: "700 17px Arial, sans-serif", color: "#EEF6FF" }}>
                  {report.totalMonthlyValueLabel}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ margin: "16px 0 0", font: "italic 400 14.5px/1.6 Arial, sans-serif", color: "#5B7BA5" }}>
          Your audit fee is credited in full toward whichever opportunity you start with.
        </p>
      </div>

      <div className="relative overflow-hidden card-accent featured" style={cardStyle}>
        <span className="br-corner-tr" />
        <div style={kicker}>RECOMMENDED NEXT STEP</div>
        <h2 style={heading}>
          Start with {recommended?.title ?? `Opportunity ${report.recommendedOpportunityRank}`}
        </h2>
        <p style={{ margin: "12px 0 20px", font: "400 18px/1.7 Arial, sans-serif", maxWidth: 620 }}>
          {report.recommendedReasoning}
        </p>
        <div style={{ ...metricBoxStyle, padding: "16px 18px" }}>
          <div style={{ font: '700 18px "Courier New", monospace', color: "#EEF6FF", marginBottom: 4 }}>
            THE FIRST EMPLOYEE
          </div>
          <div style={{ font: "400 15px Arial, sans-serif", color: "#89D4FF", marginBottom: 8 }}>
            Setup from $750, ongoing support from $150/month
          </div>
          <p style={{ margin: 0, font: "400 17.5px/1.6 Arial, sans-serif" }}>
            James builds a system trained specifically on {report.businessName}, its services,
            pricing, and tone, starting with the opportunity above. Your audit fee is credited in
            full toward this build.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden card-accent" style={cardStyle}>
        <span className="br-corner-tr" />
        <div style={kicker}>QUESTIONS THIS RAISED</div>
        <h2 style={heading}>Worth Thinking About Before You Decide</h2>
        <ul style={{ margin: "14px 0 0", paddingLeft: 18, font: "400 18px/1.8 Arial, sans-serif" }}>
          {report.questionsRaised.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
        <p style={{ margin: "18px 0 0", font: "italic 400 14.5px/1.6 Arial, sans-serif", color: "#5B7BA5" }}>
          A note on these estimates: figures above are based on the volume and patterns you shared
          in your questionnaire, not a guarantee of results. They are meant to give you a realistic,
          defensible sense of scale, actual savings depend on adoption and final scope.
        </p>
      </div>

      <div className="relative overflow-hidden card-accent" style={{ ...cardStyle, textAlign: "center" }}>
        <span className="br-corner-tr" />
        <button
          type="button"
          onClick={handleEmailPdf}
          disabled={emailState === "sending" || emailState === "sent"}
          className="transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] disabled:opacity-60 disabled:pointer-events-none"
          style={{
            padding: "12px 24px",
            borderRadius: 6,
            border: "0.8px solid #3D7FD4",
            backgroundColor: "#1A4FC4",
            color: "#EEF6FF",
            font: '400 14.5px "Courier New", monospace',
            letterSpacing: "0.1em",
            cursor: "pointer",
          }}
        >
          {emailState === "sending"
            ? "SENDING…"
            : emailState === "sent"
              ? "SENT — CHECK YOUR EMAIL"
              : "EMAIL ME A PDF"}
        </button>
        {emailState === "error" && (
          <p style={{ margin: "12px 0 0", font: "400 15px/1.5 Arial, sans-serif", color: "#F87171" }}>
            Something went wrong sending that. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
