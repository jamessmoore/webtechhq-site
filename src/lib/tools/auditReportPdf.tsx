import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { AuditReport } from "@/lib/types";

function formatWholeDollars(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11, fontFamily: "Helvetica", color: "#1A1A1A" },
  kicker: { fontSize: 9, letterSpacing: 1, color: "#5B7BA5", marginBottom: 4 },
  h1: { fontSize: 20, marginBottom: 10, color: "#0A1832" },
  h2: { fontSize: 14, marginBottom: 8, marginTop: 4, color: "#0A1832" },
  label: { fontSize: 9, letterSpacing: 0.6, color: "#5B7BA5", marginBottom: 2 },
  body: { fontSize: 11, lineHeight: 1.5, marginBottom: 8 },
  italic: { fontSize: 9.5, lineHeight: 1.4, color: "#5B7BA5", fontStyle: "italic", marginBottom: 8 },
  section: { marginBottom: 18, paddingBottom: 14, borderBottom: "0.5pt solid #C7D6EA" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  col: { flexDirection: "column", flexGrow: 1 },
  metricsRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  metricBox: { flexGrow: 1, border: "0.5pt solid #C7D6EA", borderRadius: 3, padding: 8 },
  metricValue: { fontSize: 12, fontWeight: 700, color: "#1A4FC4" },
  table: { marginTop: 8 },
  tableRow: { flexDirection: "row", borderBottom: "0.5pt solid #C7D6EA", paddingVertical: 6 },
  tableHeaderCell: { flex: 1, fontSize: 8, letterSpacing: 0.5, color: "#5B7BA5" },
  tableCell: { flex: 1, fontSize: 10 },
});

function AuditReportDocument({ report }: { report: AuditReport }) {
  const sorted = report.opportunities.slice().sort((a, b) => a.rank - b.rank);
  const recommended = sorted.find((o) => o.rank === report.recommendedOpportunityRank);
  const totalSetup = sorted.reduce((sum, o) => sum + o.setupFeeCents, 0);
  const totalMonthly = sorted.reduce((sum, o) => sum + o.monthlyFeeCents, 0);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.kicker}>BUSINESS AUDIT</Text>
          <Text style={styles.h1}>{report.businessName}</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>BUSINESS OWNER</Text>
              <Text>{report.ownerFirstName}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>AUDIT DATE</Text>
              <Text>{report.auditDate}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>PREPARED BY</Text>
              <Text>James Moore, Moore Solutions</Text>
            </View>
          </View>
          <Text style={styles.body}>{report.openingNote}</Text>
          <Text style={styles.italic}>
            These estimates are a realistic ballpark based on what you shared, not a guarantee.
            Actual results depend on adoption and a few details we confirm during implementation.
          </Text>
        </View>

        {sorted.map((opp) => (
          <View key={opp.rank} style={styles.section} wrap={false}>
            <Text style={styles.kicker}>OPPORTUNITY {opp.rank}</Text>
            <Text style={styles.h2}>{opp.title}</Text>
            <Text style={styles.label}>WHAT&apos;S HAPPENING NOW</Text>
            <Text style={styles.body}>{opp.whatsHappeningNow}</Text>
            <Text style={styles.label}>THE SOLUTION</Text>
            <Text style={styles.body}>{opp.aiSolution}</Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Text style={styles.label}>SETUP FEE</Text>
                <Text style={styles.metricValue}>{formatWholeDollars(opp.setupFeeCents)}</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.label}>MONTHLY FEE</Text>
                <Text style={styles.metricValue}>{formatWholeDollars(opp.monthlyFeeCents)}/mo</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.label}>TIME SAVED</Text>
                <Text style={styles.metricValue}>{opp.timeSavedLabel}</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.label}>MONTHLY VALUE</Text>
                <Text style={styles.metricValue}>{opp.monthlyValueLabel}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.section} wrap={false}>
          <Text style={styles.kicker}>SUMMARY &amp; BREAKDOWN</Text>
          <Text style={styles.h2}>All Three Opportunities at a Glance</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeaderCell}>OPPORTUNITY</Text>
              <Text style={styles.tableHeaderCell}>SETUP FEE</Text>
              <Text style={styles.tableHeaderCell}>MONTHLY FEE</Text>
              <Text style={styles.tableHeaderCell}>TIME SAVED</Text>
              <Text style={styles.tableHeaderCell}>MONTHLY VALUE</Text>
            </View>
            {sorted.map((opp) => (
              <View key={opp.rank} style={styles.tableRow}>
                <Text style={styles.tableCell}>{opp.rank}. {opp.title}</Text>
                <Text style={styles.tableCell}>{formatWholeDollars(opp.setupFeeCents)}</Text>
                <Text style={styles.tableCell}>{formatWholeDollars(opp.monthlyFeeCents)}/mo</Text>
                <Text style={styles.tableCell}>{opp.timeSavedLabel}</Text>
                <Text style={styles.tableCell}>{opp.monthlyValueLabel}</Text>
              </View>
            ))}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { fontWeight: 700 }]}>Total, all three</Text>
              <Text style={[styles.tableCell, { fontWeight: 700 }]}>{formatWholeDollars(totalSetup)}</Text>
              <Text style={[styles.tableCell, { fontWeight: 700 }]}>{formatWholeDollars(totalMonthly)}/mo</Text>
              <Text style={[styles.tableCell, { fontWeight: 700 }]}>{report.totalTimeSavedLabel}</Text>
              <Text style={[styles.tableCell, { fontWeight: 700 }]}>{report.totalMonthlyValueLabel}</Text>
            </View>
          </View>
          <Text style={[styles.italic, { marginTop: 8 }]}>
            Your audit fee is credited in full toward whichever opportunity you start with.
          </Text>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.kicker}>RECOMMENDED NEXT STEP</Text>
          <Text style={styles.h2}>Start with {recommended?.title ?? `Opportunity ${report.recommendedOpportunityRank}`}</Text>
          <Text style={styles.body}>{report.recommendedReasoning}</Text>
          <View style={styles.metricBox}>
            <Text style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>THE FIRST EMPLOYEE</Text>
            <Text style={{ fontSize: 10, color: "#1A4FC4", marginBottom: 6 }}>
              Setup from $750, ongoing support from $150/month
            </Text>
            <Text style={{ fontSize: 10, lineHeight: 1.4 }}>
              James builds a system trained specifically on {report.businessName}, its services,
              pricing, and tone, starting with the opportunity above. Your audit fee is credited in
              full toward this build.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.kicker}>QUESTIONS THIS RAISED</Text>
          <Text style={styles.h2}>Worth Thinking About Before You Decide</Text>
          {report.questionsRaised.map((q, i) => (
            <Text key={i} style={styles.body}>{"•"} {q}</Text>
          ))}
          <Text style={styles.italic}>
            A note on these estimates: figures above are based on the volume and patterns you shared
            in your questionnaire, not a guarantee of results. They are meant to give you a
            realistic, defensible sense of scale, actual savings depend on adoption and final scope.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderAuditReportPdf(report: AuditReport): Promise<Buffer> {
  return renderToBuffer(<AuditReportDocument report={report} />);
}
