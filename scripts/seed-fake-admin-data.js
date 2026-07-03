#!/usr/bin/env node
// Seeds the local dev database with a batch of fake users and questionnaire
// submissions so the admin panel (/admin, /admin/users/[id]) has realistic,
// varied data to review without manually driving signups one at a time.
//
// Usage: npm run seed:fake-admin-data
//   DATABASE_PATH=... to target a non-default db file
//
// Safe to re-run: it clears any previously-seeded fake users (identified by
// the @*.example.com email suffix) before reinserting, so it never touches
// real accounts.

const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");

const DB_PATH = process.env.DATABASE_PATH ?? "./data/submissions.db";
const resolvedDb = path.resolve(process.cwd(), DB_PATH);

const db = new Database(resolvedDb);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const SEED_PASSWORD = "TestPassword123";
const PASSWORD_HASH = bcrypt.hashSync(SEED_PASSWORD, 12);

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function insertUser({ firstName, lastName, email, verified, signupDaysAgo }) {
  const id = crypto.randomUUID();
  const createdAt = daysAgo(signupDaysAgo);
  db.prepare(`
    INSERT INTO users (
      id, first_name, last_name, email, password_hash, google_id,
      email_verified, email_verified_at, verification_token, verification_expires_at, created_at
    ) VALUES (?, ?, ?, ?, ?, NULL, ?, ?, NULL, NULL, ?)
  `).run(
    id,
    firstName,
    lastName,
    email,
    PASSWORD_HASH,
    verified ? 1 : 0,
    verified ? createdAt : null,
    createdAt,
  );
  return id;
}

function renderFakePrompt(v) {
  return `You are an experienced business coach with hands-on, practical expertise in AI and automation for small businesses. You're talking with the owner of ${v.businessType}. Your job is to help them think expansively about where AI could realistically help their business, not to hand them a finished build plan, specific tools or vendors, pricing, or step-by-step implementation instructions. You're here to open their thinking, ask sharp questions, and help them arrive at a clearer picture of the opportunity themselves.

What they told me:
- Biggest operational headache: ${v.layer1Problem}
- Task they'd eliminate first: ${v.layer1Elimination}
- Time cost: about ${v.layer2Hours} hrs/week at roughly ${v.layer2Salary}
- Task type: ${v.layer3Repetitive}
- Compliance concerns: ${v.layer3Compliance}${v.layer3ComplianceDetail ? ` (${v.layer3ComplianceDetail})` : ""}
- Data availability: ${v.layer3Data}

How to run this conversation:
- Reflect back what you're hearing in plain language first, so they feel understood.
- Ask exactly one clarifying question, then STOP and wait for their reply before saying anything else.
- Once you have enough to go on, sketch 2-3 directions worth exploring, described conceptually, never as a technical spec, code, or vendor names.
- Do not calculate or state specific dollar savings, ROI, or payback-period figures.
- Once the conversation has reached a reasonably clear picture, recommend a scoping conversation with James Moore, an AI implementation specialist.

Tone: warm, direct, no hype. Acknowledge real trade-offs and effort.`;
}

function insertSubmission(userId, v, { submittedDaysAgo, adminNotes, additionalNotes }) {
  const id = crypto.randomUUID();
  const submittedAt = daysAgo(submittedDaysAgo);
  db.prepare(`
    INSERT INTO submissions (
      id, user_id, business_type, team_size,
      layer1_problem, layer1_elimination,
      layer2_hours, layer2_salary,
      layer3_repetitive, layer3_compliance, layer3_compliance_detail, layer3_data,
      additional_notes, rendered_prompt, submitted_at, created_at, validation_flags,
      approval_status, admin_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', 'pending_review', ?)
  `).run(
    id,
    userId,
    v.businessType,
    v.teamSize,
    v.layer1Problem,
    v.layer1Elimination,
    v.layer2Hours,
    v.layer2Salary,
    v.layer3Repetitive,
    v.layer3Compliance,
    v.layer3ComplianceDetail ?? null,
    v.layer3Data,
    additionalNotes ?? null,
    renderFakePrompt(v),
    submittedAt,
    submittedAt,
    adminNotes ?? null,
  );
}

const EMAIL_SUFFIX = ".example.com";

const people = [
  {
    firstName: "Sarah", lastName: "Chen", email: "sarah.chen@brightleafplumbing.example.com",
    verified: true, signupDaysAgo: 21,
    submission: {
      businessType: "a residential plumbing company", teamSize: "2-5",
      layer1Problem: "We miss a lot of after-hours calls and by the time we call back the next morning, half of them already booked someone else.",
      layer1Elimination: "Manually calling back every voicemail lead first thing in the morning.",
      layer2Hours: 8, layer2Salary: "$20–40/hr",
      layer3Repetitive: "Mostly repetitive", layer3Compliance: "No concerns", layer3Data: "Somewhat, it's scattered",
      additionalNotes: "We use Jobber for scheduling if that matters.",
    },
    submittedDaysAgo: 19, adminNotes: "Great fit for AI First Employee, follow up about Jobber integration.",
  },
  {
    firstName: "Marcus", lastName: "Webb", email: "marcus@webbhvac.example.com",
    verified: true, signupDaysAgo: 18,
    submission: {
      businessType: "an HVAC repair and installation business", teamSize: "6-10",
      layer1Problem: "Dispatching techs to the right job with the right parts eats up two hours of my day every morning.",
      layer1Elimination: "Manually re-triaging the day's schedule when a tech calls in sick or a job runs long.",
      layer2Hours: 12, layer2Salary: "$40–75/hr",
      layer3Repetitive: "Mix of both", layer3Compliance: "Maybe", layer3ComplianceDetail: "We store customer home access codes, not sure how that should be handled.",
      layer3Data: "Yes, we're organized",
    },
    submittedDaysAgo: 15, adminNotes: null,
  },
  {
    firstName: "Dana", lastName: "Ruiz", email: "dana.ruiz@cleanslatecleaning.example.com",
    verified: true, signupDaysAgo: 27,
    submission: {
      businessType: "a residential cleaning company", teamSize: "10+",
      layer1Problem: "Booking intake is all over the place, texts, calls, a web form, and a Facebook inbox, and things fall through the cracks.",
      layer1Elimination: "Copy-pasting booking requests from four different channels into one spreadsheet.",
      layer2Hours: 15, layer2Salary: "Under $20/hr",
      layer3Repetitive: "Mostly repetitive", layer3Compliance: "No concerns", layer3Data: "Not really",
      additionalNotes: "Growing fast, added 3 crews this year.",
    },
    submittedDaysAgo: 25, adminNotes: "Strong AI First Employee candidate, unify the intake channels first.",
  },
  {
    firstName: "Tom", lastName: "Whitfield", email: "tom@whitfieldrealty.example.com",
    verified: true, signupDaysAgo: 9,
    submission: {
      businessType: "a solo residential real estate practice", teamSize: "Solo",
      layer1Problem: "I spend hours qualifying leads from Zillow that go nowhere, most aren't ready to buy for months.",
      layer1Elimination: "The first three back-and-forth texts with every new lead just to figure out if they're serious.",
      layer2Hours: 10, layer2Salary: "$75–150/hr",
      layer3Repetitive: "Mostly judgment calls", layer3Compliance: "No concerns", layer3Data: "Somewhat, it's scattered",
    },
    submittedDaysAgo: 7, adminNotes: null,
  },
  {
    firstName: "Priya", lastName: "Anand", email: "priya@sagecoaching.example.com",
    verified: true, signupDaysAgo: 33,
    submission: {
      businessType: "a solo business coaching practice", teamSize: "Solo",
      layer1Problem: "Discovery calls with people who aren't a fit take up almost as much time as the real client work.",
      layer1Elimination: "Screening discovery call requests before they hit my calendar.",
      layer2Hours: 6, layer2Salary: "$150+/hr",
      layer3Repetitive: "Mix of both", layer3Compliance: "No concerns", layer3Data: "Yes, we're organized",
      additionalNotes: "Already tried a Calendly form, didn't filter well enough.",
    },
    submittedDaysAgo: 30, adminNotes: "Started with AI First Employee 2026-06-10, went well.",
  },
  {
    firstName: "Jake", lastName: "Alvarez", email: "jake@alvarezautobody.example.com",
    verified: true, signupDaysAgo: 6,
    submission: {
      businessType: "an auto body repair shop", teamSize: "6-10",
      layer1Problem: "Insurance estimate follow-ups and status update calls take a huge chunk of the front desk's day.",
      layer1Elimination: "Calling customers with the same 'still waiting on the part' update every few days.",
      layer2Hours: 9, layer2Salary: "$20–40/hr",
      layer3Repetitive: "Mostly repetitive", layer3Compliance: "No concerns", layer3Data: "Somewhat, it's scattered",
    },
    submittedDaysAgo: 4, adminNotes: null,
  },
  {
    firstName: "Linda", lastName: "Osei", email: "linda@urbanbloomboutique.example.com",
    verified: true, signupDaysAgo: 14,
    submission: {
      businessType: "a small boutique clothing retailer", teamSize: "2-5",
      layer1Problem: "We don't have a good way to follow up with repeat customers about new arrivals, it's all word of mouth.",
      layer1Elimination: "Manually texting regulars every time something new comes in.",
      layer2Hours: 4, layer2Salary: "Under $20/hr",
      layer3Repetitive: "Mostly repetitive", layer3Compliance: "No concerns", layer3Data: "Not really",
      additionalNotes: "Instagram is our main channel right now.",
    },
    submittedDaysAgo: 12, adminNotes: "Good candidate but small budget, start with the $50 founding audit tier.",
  },
  {
    firstName: "Kevin", lastName: "Sato", email: "kevin@satoelectric.example.com",
    verified: true, signupDaysAgo: 11,
    submission: {
      businessType: "a licensed electrical contracting business", teamSize: "2-5",
      layer1Problem: "Permit paperwork and inspection scheduling across three counties is a constant headache.",
      layer1Elimination: "Cross-checking each county's permit portal for status updates.",
      layer2Hours: 7, layer2Salary: "$40–75/hr",
      layer3Repetitive: "Mostly repetitive", layer3Compliance: "Yes, significant concerns", layer3ComplianceDetail: "Licensing and permit data is tied to state regulatory systems, want to be careful automating anything customer-facing there.",
      layer3Data: "Yes, we're organized",
    },
    submittedDaysAgo: 9, adminNotes: "Flag compliance concerns for the call, don't overpromise on the permit automation piece.",
  },
  {
    firstName: "Nora", lastName: "Fitzgerald", email: "nora@fitzgeraldlaw.example.com",
    verified: true, signupDaysAgo: 40,
    submission: {
      businessType: "a solo family law practice", teamSize: "Solo",
      layer1Problem: "Intake calls with prospective clients often cover the same ground before I even know if I can take the case.",
      layer1Elimination: "Re-asking the same intake questions on every single prospective client call.",
      layer2Hours: 5, layer2Salary: "$150+/hr",
      layer3Repetitive: "Mix of both", layer3Compliance: "Yes, significant concerns", layer3ComplianceDetail: "Attorney-client privilege and confidentiality make me nervous about anything touching case details.",
      layer3Data: "Somewhat, it's scattered",
    },
    submittedDaysAgo: 37, adminNotes: "Compliance-sensitive, keep scope to non-privileged intake triage only.",
  },
  {
    firstName: "Sam", lastName: "Turner", email: "sam@turnermoving.example.com",
    verified: true, signupDaysAgo: 5,
    submission: {
      businessType: "a regional moving and storage company", teamSize: "10+",
      layer1Problem: "Quoting new jobs over the phone takes forever because every crew lead does it differently.",
      layer1Elimination: "Building a custom quote from scratch for every single inbound call.",
      layer2Hours: 20, layer2Salary: "$20–40/hr",
      layer3Repetitive: "Mostly repetitive", layer3Compliance: "No concerns", layer3Data: "Yes, we're organized",
      additionalNotes: "Have historical quote data going back 5 years.",
    },
    submittedDaysAgo: 3, adminNotes: null,
  },
  {
    firstName: "Wendy", lastName: "Cho", email: "wendy@choaccounting.example.com",
    verified: true, signupDaysAgo: 2,
    submission: {
      businessType: "a small bookkeeping and accounting firm", teamSize: "2-5",
      layer1Problem: "Chasing clients every month for missing receipts and statements before we can close their books.",
      layer1Elimination: "Sending the same reminder emails to clients who are behind on documents.",
      layer2Hours: 6, layer2Salary: "$40–75/hr",
      layer3Repetitive: "Mostly repetitive", layer3Compliance: "Maybe", layer3ComplianceDetail: "Financial documents, want to make sure anything automated is still SOC-2-appropriate.",
      layer3Data: "Yes, we're organized",
    },
    submittedDaysAgo: 1, adminNotes: null,
  },
  // Verified, no submission yet (dropped off after signup)
  {
    firstName: "Ray", lastName: "Doyle", email: "ray@doylelandscaping.example.com",
    verified: true, signupDaysAgo: 3, submission: null,
  },
  {
    firstName: "Michelle", lastName: "Park", email: "michelle@parkfamilydental.example.com",
    verified: true, signupDaysAgo: 1, submission: null,
  },
  {
    firstName: "Derek", lastName: "Holt", email: "derek@holtfitness.example.com",
    verified: true, signupDaysAgo: 16, submission: null,
  },
  // Unverified, no submission
  {
    firstName: "Carlos", lastName: "Mendez", email: "carlos@mendezroofing.example.com",
    verified: false, signupDaysAgo: 2, submission: null,
  },
  {
    firstName: "Aisha", lastName: "Bello", email: "aisha@bellocatering.example.com",
    verified: false, signupDaysAgo: 0, submission: null,
  },
  {
    firstName: "Tasha", lastName: "Reed", email: "tasha@reedbookkeeping.example.com",
    verified: false, signupDaysAgo: 5, submission: null,
  },
];

const seedAll = db.transaction(() => {
  db.prepare(`DELETE FROM users WHERE email LIKE ?`).run(`%${EMAIL_SUFFIX}`);

  for (const p of people) {
    const userId = insertUser({
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      verified: p.verified,
      signupDaysAgo: p.signupDaysAgo,
    });
    if (p.submission) {
      insertSubmission(userId, p.submission, {
        submittedDaysAgo: p.submittedDaysAgo,
        adminNotes: p.adminNotes,
        additionalNotes: p.submission.additionalNotes,
      });
    }
  }
});

seedAll();

const withSubmission = people.filter((p) => p.submission).length;
console.log(`Seeded ${people.length} fake users (${withSubmission} with submissions) into ${resolvedDb}`);
console.log(`All fake accounts share the password: ${SEED_PASSWORD}`);
console.log(`Re-run any time to reset just this fake data (matched by "${EMAIL_SUFFIX}" email suffix) without touching real accounts.`);
