// Static placeholder report content, matching the design prototype.
// Not derived from real submission data — a real scoring/report-generation
// engine is future work. See design_handoff_client_tools/README.md.

export interface Opportunity {
  rank: number;
  title: string;
  cat: string;
  impact: "High" | "Medium" | "Foundational";
  effort: "Low" | "Medium" | "High";
  time: string;
  fit: number;
  plain: string;
  looks: string[];
  rollout: string;
}

export const REPORT_SCORE = 78;

export const KPIS: { v: string; u: string }[] = [
  { v: "~12 hrs", u: "you could recover every week" },
  { v: "3", u: "quick wins you can start now" },
  { v: "$2.4k", u: "estimated value per month" },
];

export const READINESS_BARS: { label: string; pct: number }[] = [
  { label: "Lead capture & response", pct: 55 },
  { label: "Sales & follow-up", pct: 40 },
  { label: "Operations & admin", pct: 48 },
  { label: "Online presence", pct: 72 },
  { label: "Data foundation", pct: 38 },
];

export const OPPORTUNITIES: Opportunity[] = [
  {
    rank: 1,
    title: "Instant lead response",
    cat: "Lead capture",
    impact: "High",
    effort: "Low",
    time: "~5 HRS/WK",
    fit: 94,
    plain: "Every new inquiry gets a friendly, accurate reply in under a minute — day or night — so hot leads never go cold while you're out on a job.",
    looks: [
      "Auto-replies to web forms, texts, and missed calls within 60 seconds",
      "Answers common questions and books the next step automatically",
      "Hands you a clean summary the moment it's a real opportunity",
    ],
    rollout: "Start with after-hours auto-reply this month, then expand to full-day coverage once you've seen it work.",
  },
  {
    rank: 2,
    title: "Quotes & follow-ups on autopilot",
    cat: "Sales",
    impact: "High",
    effort: "Medium",
    time: "~3 HRS/WK",
    fit: 88,
    plain: "Turn a few details into a polished quote in minutes, then let the system politely nudge customers who haven't replied — on your behalf.",
    looks: [
      "Draft quotes from a short voice note or a few fields",
      "Automatic, friendly follow-ups until they answer",
      "You approve before anything goes out",
    ],
    rollout: "Begin with follow-up reminders on existing quotes, add auto-drafting once the template feels right.",
  },
  {
    rank: 3,
    title: "Website FAQ assistant",
    cat: "Customer service",
    impact: "Medium",
    effort: "Low",
    time: "~2 HRS/WK",
    fit: 85,
    plain: "A helper on your site that answers \"do you serve my area?\", \"what does it cost?\", and \"are you open Saturday?\" so you field far fewer repetitive calls.",
    looks: [
      "Trained only on your real services, pricing, and hours",
      "Collects name and number when someone's ready to buy",
      "Works on your existing site — no rebuild needed",
    ],
    rollout: "Stand it up on your top 10 questions, then refine from real conversations over the first two weeks.",
  },
  {
    rank: 4,
    title: "Smart scheduling & reminders",
    cat: "Operations",
    impact: "Medium",
    effort: "Medium",
    time: "~2 HRS/WK",
    fit: 79,
    plain: "Let customers self-book real openings and get automatic reminders — cutting no-shows and the endless phone tag.",
    looks: [
      "Customers see only the slots you actually have open",
      "Text and email reminders go out automatically",
      "Reschedules handle themselves",
    ],
    rollout: "Connect your calendar first, switch on reminders, then open self-booking when you're ready.",
  },
  {
    rank: 5,
    title: "Review & reputation autopilot",
    cat: "Marketing",
    impact: "Medium",
    effort: "Low",
    time: "~1 HR/WK",
    fit: 74,
    plain: "Automatically ask happy customers for a review at exactly the right moment, and get help drafting replies to the ones you receive.",
    looks: [
      "Review requests sent right after a job's done",
      "Draft responses to every review, good or bad",
      "More five-stars without you remembering to ask",
    ],
    rollout: "Turn on review requests for completed jobs, layer in drafted replies after the first batch lands.",
  },
  {
    rank: 6,
    title: "Get your customer data in one place",
    cat: "Foundation",
    impact: "Foundational",
    effort: "Medium",
    time: "SETUP",
    fit: 66,
    plain: "Right now details live in your head, your texts, and a few spreadsheets. Centralizing them is the groundwork that makes everything above work better.",
    looks: [
      "One simple, searchable home for every customer",
      "No more hunting through threads for a phone number",
      "Sets you up to automate without the mess",
    ],
    rollout: "We migrate what you have, no big software project — and keep it dead simple to maintain.",
  },
];

export const COMING_SOON_TOOLS: { glyph: string; name: string; desc: string }[] = [
  { glyph: "✎", name: "Content Assistant", desc: "Draft posts, emails, and replies in your voice — in seconds." },
  { glyph: "★", name: "Review Responder", desc: "Friendly, on-brand replies to every review you get." },
  { glyph: "◎", name: "Competitor Scan", desc: "See what nearby businesses are doing online, summarized." },
];
