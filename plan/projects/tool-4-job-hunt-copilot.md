# Tool 4 — Job-Hunt Copilot (application tracker + AI match scoring)

**Type:** Automation/workflow tool · **Effort:** ~2-3 weeks · Dogfooded during Jerome's own Germany search.

## Problem
Active job seekers juggle dozens of applications across portals; tailoring every application is slow; follow-ups get missed.

## Target user
Tech job seekers, especially internationals targeting Germany (visa/relocation fields built in). First user: Jerome.

## MVP features
1. **Pipeline board:** kanban — saved → applied → interviewing → offer/rejected. Drag between stages; every card timestamped automatically.
2. **Job ingest:** paste job-ad URL or raw text → AI extracts company, role, stack, salary hints, language requirement (DE/EN), visa sponsorship signals → creates card.
3. **Match score:** compares job ad against stored CV/profile → score + gap list ("asks Vue — you have none; asks React — strong") + honest "worth applying?" verdict.
4. **Tailoring assistant:** generates CV bullet reorder suggestions + a role-specific cover-letter draft (EN or DE) from user's master profile. Copy out; no auto-apply.
5. **Follow-up nudges:** stage-age rules (applied >10 days → "nudge?"), daily digest view. Email digest optional via Resend.
6. **Stats:** funnel conversion, response rate by channel, applications/week.

## Stack
Next.js 15, Tailwind v4, shadcn (kanban via dnd-kit), Postgres+Drizzle, Anthropic SDK (`claude-sonnet-5` scoring/letters, `claude-haiku-4-5-20251001` extraction), Resend, Vercel.

## Data model
profile(master_cv text, preferences json) · applications(company, role, url, ad_text, extracted json, match json, stage, stage_history json[]) · documents(application_id, type[cover|cv-notes], content)

## Case-study angle
"Built the tool that ran my own Germany job search" — funnel screenshot (anonymized companies), match-score demo on a public job ad. Deeply relatable to hiring managers; shows AI + product thinking + personal initiative.
