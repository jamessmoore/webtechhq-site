import { AnthropicBedrock } from "@anthropic-ai/bedrock-sdk";
import type { AuditReport, Submission } from "@/lib/types";

const MODEL = process.env.BEDROCK_MODEL_ID ?? "us.anthropic.claude-sonnet-4-6";
const AWS_REGION = process.env.AWS_REGION ?? "us-west-2";

const REPORT_TOOL_NAME = "submit_audit_report";

const REPORT_TOOL_SCHEMA = {
  name: REPORT_TOOL_NAME,
  description: "Submit the completed Business Audit report content.",
  input_schema: {
    type: "object" as const,
    properties: {
      openingNote: {
        type: "string",
        description:
          "A short, warm opening paragraph thanking the client for the interest and framing the three opportunities below. Reference what they shared in their questionnaire, never a call.",
      },
      opportunities: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            rank: { type: "integer" },
            title: { type: "string", description: "Short, specific headline for this opportunity." },
            whatsHappeningNow: {
              type: "string",
              description: "Plain-English restatement of the client's actual pain point, referencing their questionnaire answers.",
            },
            aiSolution: {
              type: "string",
              description: "Plain-English description of the automated solution. Do not use the word AI in a product name.",
            },
            setupFeeCents: { type: "integer" },
            monthlyFeeCents: { type: "integer" },
            timeSavedLabel: { type: "string", description: "e.g. '5-7 hrs/week'" },
            monthlyValueLabel: { type: "string", description: "e.g. '$1,800-$2,400/mo' or 'Indirect - SEO value'" },
          },
          required: [
            "rank",
            "title",
            "whatsHappeningNow",
            "aiSolution",
            "setupFeeCents",
            "monthlyFeeCents",
            "timeSavedLabel",
            "monthlyValueLabel",
          ],
        },
      },
      totalTimeSavedLabel: { type: "string", description: "e.g. '11-16 hrs/week'" },
      totalMonthlyValueLabel: { type: "string", description: "e.g. '$3,000-$4,200+/mo'" },
      recommendedOpportunityRank: { type: "integer", description: "Which opportunity (1-3) to recommend starting with." },
      recommendedReasoning: {
        type: "string",
        description: "Why that opportunity is the right starting point, tied to the First Employee package and noting the audit fee credits in full toward it.",
      },
      questionsRaised: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: { type: "string" },
        description: "Short, specific open questions worth resolving before implementation.",
      },
    },
    required: [
      "openingNote",
      "opportunities",
      "totalTimeSavedLabel",
      "totalMonthlyValueLabel",
      "recommendedOpportunityRank",
      "recommendedReasoning",
      "questionsRaised",
    ],
  },
};

function buildPrompt(submission: Submission, businessName: string, ownerFirstName: string): string {
  const lines = [
    `Business name: ${businessName}`,
    `Owner first name: ${ownerFirstName}`,
    `Business type: ${submission.businessType ?? "not specified"}`,
    `Team size: ${submission.teamSize ?? "not specified"}`,
    `Biggest repetitive/manual problem: ${submission.layer1Problem ?? "not specified"}`,
    `What they'd eliminate first if they could: ${submission.layer1Elimination ?? "not specified"}`,
    `Hours per week spent on this: ${submission.layer2Hours ?? "not specified"}`,
    `Estimated salary/rate tied to that time: ${submission.layer2Salary ?? "not specified"}`,
    `Is the work mostly repetitive or judgment calls: ${submission.layer3Repetitive ?? "not specified"}`,
    `Compliance concerns: ${submission.layer3Compliance ?? "not specified"}`,
    `Compliance detail: ${submission.layer3ComplianceDetail ?? "none"}`,
    `Is their data organized: ${submission.layer3Data ?? "not specified"}`,
    `Additional notes: ${submission.additionalNotes ?? "none"}`,
  ];
  if (submission.renderedPrompt) {
    lines.push(`Synthesized opportunity summary already generated for this client:\n${submission.renderedPrompt}`);
  }
  return lines.join("\n");
}

export async function generateAuditReport({
  submission,
  businessName,
  ownerFirstName,
}: {
  submission: Submission;
  businessName: string;
  ownerFirstName: string;
}): Promise<AuditReport> {
  const client = new AnthropicBedrock({ awsRegion: AWS_REGION });

  const systemPrompt = `You write Business Audit reports for Moore Solutions, an AI-powered automation consultancy for small businesses. Voice: knowledgeable but approachable, confident without arrogance, direct, occasionally humorous, faith-informed but never preachy. Never use em dashes. Never use the word "AI" inside a product or tool name (write "the assistant," "the system," "the automation," not "the AI Assistant"). The client filled out a questionnaire, there was no discovery call, so never reference "our call" or "when we talked," always reference "what you shared" or "your questionnaire answers." Identify exactly three ranked opportunities, most impactful first, each grounded in the specific answers given below. Setup fees and monthly fees should be realistic for small-business automation work (roughly $250-$900 setup, $50-$200/month). Every dollar figure must be internally consistent between the opportunities and the totals you report.`;

  const userPrompt = `Generate the Business Audit report content for this client based on their questionnaire answers:\n\n${buildPrompt(submission, businessName, ownerFirstName)}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
    tools: [REPORT_TOOL_SCHEMA],
    tool_choice: { type: "tool", name: REPORT_TOOL_NAME },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Anthropic response did not include the expected tool call.");
  }

  const input = toolUse.input as Omit<AuditReport, "businessName" | "ownerFirstName" | "auditDate">;

  return {
    businessName,
    ownerFirstName,
    auditDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    ...input,
  };
}
