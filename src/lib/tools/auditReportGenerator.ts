import { AnthropicBedrock } from "@anthropic-ai/bedrock-sdk";
import type { AuditReport, Submission } from "@/lib/types";
import { getAuditPromptConfig } from "./auditPromptConfig";

const MODEL = process.env.BEDROCK_MODEL_ID ?? "us.anthropic.claude-sonnet-4-6";
const AWS_REGION = process.env.AWS_REGION ?? "us-west-2";

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
  const { systemPrompt, toolSchema } = getAuditPromptConfig();

  const userPrompt = `Generate the Business Audit report content for this client based on their questionnaire answers:\n\n${buildPrompt(submission, businessName, ownerFirstName)}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
    tools: [toolSchema],
    tool_choice: { type: "tool", name: toolSchema.name },
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
