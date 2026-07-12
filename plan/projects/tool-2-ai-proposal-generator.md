# Tool 2 — Briefly: AI Proposal Generator for freelancers & agencies

**Type:** AI business tool · **Effort:** ~3 weeks

## Problem
Freelancers/small agencies lose hours writing proposals; quality varies; slow response loses deals. 

## Target user
Freelance devs/designers, 1-10 person agencies. (Jerome's own freelance niche — doubles as his sales tool.)

## MVP features
1. **Intake:** paste client brief / call notes / email thread (raw text). Optional: answer 4 quick questions (budget range, timeline, deliverables known?, tone).
2. **AI analysis pass:** Claude extracts: client goals, explicit requirements, unstated risks, missing info → shows "clarify before sending?" checklist.
3. **Proposal draft:** structured doc — understanding of problem, proposed approach, scope table (in/out), timeline with milestones, pricing table (user enters numbers; AI suggests packaging: fixed/milestone/retainer), next steps. User's saved service catalog + past-proposal tone informs generation.
4. **Editor:** block-based editing, regenerate per block.
5. **Export/share:** branded PDF (react-pdf) + shareable web link with view tracking (opened, time on page) — the "wow" feature for the case study.
6. **Library:** past proposals, duplicate-and-adapt, win/loss marking → win-rate stats.

## Stack
Next.js 15, Tailwind v4, shadcn, Postgres+Drizzle, Anthropic SDK (`claude-sonnet-5`), react-pdf, Vercel. Auth: better-auth or Clerk free tier.

## Data model
users(brand, service_catalog json) · proposals(source_brief, analysis json, blocks json, status, share_slug, price_total) · proposal_views(share_slug, ts, duration)

## Case-study angle
"From client brief to sendable proposal in 10 minutes." Demo flow with fictional brief; show risk-analysis checklist + link-tracking dashboard. Strong agency-appeal.
