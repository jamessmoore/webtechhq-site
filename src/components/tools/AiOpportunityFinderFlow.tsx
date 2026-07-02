"use client";

import { useState } from "react";
import Questionnaire from "@/components/Questionnaire";
import PromptDisplay from "@/components/tools/PromptDisplay";

export default function AiOpportunityFinderFlow({
  firstName,
  email,
  emailVerified,
  alreadySubmitted,
  initialPrompt,
}: {
  firstName: string;
  email: string;
  emailVerified: boolean;
  alreadySubmitted: boolean;
  /** The stored prompt from a prior submission, if any. */
  initialPrompt: string | null;
}) {
  const [prompt, setPrompt] = useState<string | null>(initialPrompt);
  // Tracks "a submission now exists" separately from `prompt` so that if
  // rendering somehow produces no prompt (e.g. no templates seeded yet),
  // Questionnaire falls back to its own "already submitted" state instead
  // of showing the intake form again.
  const [submitted, setSubmitted] = useState(alreadySubmitted);

  function handleSubmitted(renderedPrompt: string | null) {
    setSubmitted(true);
    setPrompt(renderedPrompt);
  }

  if (prompt) {
    return <PromptDisplay firstName={firstName} prompt={prompt} />;
  }

  return (
    <>
      <h1
        style={{
          margin: 0,
          font: '400 clamp(21px,4vw,27px)/1.2 "Courier New", monospace',
          color: "#EEF6FF",
          letterSpacing: "0.01em",
        }}
      >
        Let&apos;s find your best AI opportunities
      </h1>
      <p
        style={{
          margin: "11px 0 0",
          font: "400 clamp(14px,2.4vw,15.5px)/1.6 Arial, sans-serif",
          color: "#80AEE0",
        }}
      >
        There are no wrong answers, just tell us how things really work today. The more honest
        you are, the sharper your report.
      </p>

      <div style={{ marginTop: 32 }}>
        <Questionnaire
          firstName={firstName}
          email={email}
          emailVerified={emailVerified}
          alreadySubmitted={submitted}
          onSubmitted={handleSubmitted}
          showAiDisclosure={false}
        />
      </div>
    </>
  );
}
