import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

/**
 * Regression test for a production incident: four PRs merged within ~10
 * minutes fired four overlapping Deploy workflow runs with no queueing.
 * Each one sent its own SSM command to run npm ci/npm run build/pm2
 * restart concurrently on the same EC2 instance, which starved the box
 * badly enough that the SSM agent itself went unresponsive and the site
 * went down. Separately, the Actions-side poll loop only waited 15
 * minutes while the SSM command itself was allowed 30, so slow-but-still-
 * running deploys were reported as failed before they actually finished.
 *
 * This doesn't spin up real GitHub Actions - it asserts the two invariants
 * that prevent the incident directly against the workflow YAML, so an edit
 * that quietly drops the concurrency guard or desyncs the poll loop from
 * the SSM timeout fails CI instead of only surfacing during a real deploy.
 */

const workflowPath = path.resolve(
  __dirname,
  "../../../.github/workflows/deploy.yml",
);
const workflow = fs.readFileSync(workflowPath, "utf-8");

function extractJobBlock(source: string, jobName: string): string {
  const jobHeaderRe = new RegExp(`\\n  ${jobName}:\\n`);
  const match = jobHeaderRe.exec(source);
  if (!match) {
    throw new Error(`Could not find job "${jobName}" in ${workflowPath}`);
  }
  const start = match.index + match[0].length;
  const rest = source.slice(start);
  // Next top-level (2-space-indented) key ends this job's block.
  const nextJobMatch = /\n {2}\S/.exec(rest);
  return nextJobMatch ? rest.slice(0, nextJobMatch.index) : rest;
}

describe("deploy.yml", () => {
  const deployJob = extractJobBlock(workflow, "deploy");

  it("serializes deploys instead of letting overlapping runs race the same instance", () => {
    const concurrencyMatch =
      /concurrency:\s*\n\s+group:\s*(\S+)\s*\n\s+cancel-in-progress:\s*(\S+)/.exec(
        deployJob,
      );

    expect(
      concurrencyMatch,
      "deploy job must declare a concurrency block so overlapping merges queue rather than run npm ci/build/pm2 concurrently on the same box",
    ).not.toBeNull();

    const [, group, cancelInProgress] = concurrencyMatch!;
    expect(group.length).toBeGreaterThan(0);
    // false (not "cancel-in-progress: true") - a queued deploy must still
    // run to completion, not get killed mid-build by the next merge.
    expect(cancelInProgress).toBe("false");
  });

  it("polls at least as long as the SSM command itself is allowed to run", () => {
    const timeoutMatch = /--timeout-seconds\s+(\d+)/.exec(deployJob);
    expect(timeoutMatch, "expected --timeout-seconds on the SSM send-command").not.toBeNull();
    const ssmTimeoutSeconds = Number(timeoutMatch![1]);

    const loopMatch = /seq 1 (\d+)/.exec(deployJob);
    expect(loopMatch, "expected a `seq 1 N` poll loop").not.toBeNull();
    const iterations = Number(loopMatch![1]);

    const sleepMatch = /Pending\|InProgress\|Delayed\)\s*sleep\s+(\d+)/.exec(
      deployJob,
    );
    expect(
      sleepMatch,
      "expected a sleep duration on the Pending|InProgress|Delayed poll branch",
    ).not.toBeNull();
    const sleepSeconds = Number(sleepMatch![1]);

    const maxPollSeconds = iterations * sleepSeconds;

    expect(
      maxPollSeconds,
      `poll loop only waits up to ${maxPollSeconds}s but the SSM command is allowed ${ssmTimeoutSeconds}s - a legitimately slow deploy will be reported as failed before it actually finishes`,
    ).toBeGreaterThanOrEqual(ssmTimeoutSeconds);
  });
});
