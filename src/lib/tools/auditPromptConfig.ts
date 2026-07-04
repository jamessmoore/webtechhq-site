import { getDb } from "@/lib/db";

// Lookup logic only — the actual system prompt and tool-schema steering text
// live in the `agent_prompt_config` table, seeded from a gitignored local
// file (see scripts/seed-agent-prompt-config.js). This file must never
// contain prompt or schema description text.

const CONFIG_KEY = "business_audit_report";

export interface AuditToolSchema {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
}

export interface AuditPromptConfig {
  systemPrompt: string;
  toolSchema: AuditToolSchema;
}

export function getAuditPromptConfig(): AuditPromptConfig {
  const db = getDb();
  const row = db
    .prepare(`SELECT system_prompt, tool_schema_json FROM agent_prompt_config WHERE config_key = ?`)
    .get(CONFIG_KEY) as { system_prompt: string; tool_schema_json: string } | undefined;

  if (!row) {
    throw new Error(
      `Audit prompt config not seeded (config_key="${CONFIG_KEY}") — run npm run seed:agent-prompt-config`,
    );
  }

  return {
    systemPrompt: row.system_prompt,
    toolSchema: JSON.parse(row.tool_schema_json) as AuditToolSchema,
  };
}
