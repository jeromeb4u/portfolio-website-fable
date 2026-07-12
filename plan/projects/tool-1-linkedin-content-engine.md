# Tool 1 — LinkedIn Content Engine (AI post generator)

**Type:** AI business tool · **Effort:** ~2-3 weeks · **Priority: build FIRST** — Jerome needs it himself for his LinkedIn consistency goal, so the case study writes itself ("I built the tool I use daily").

## Problem
Professionals know consistent LinkedIn posting builds visibility but stall on ideation, drafting, and formatting. Existing tools (Taplio etc.) cost $39+/mo.

## Target user
Job seekers + freelancers + solo founders building presence. First user: Jerome.

## MVP features
1. **Profile setup:** user pastes their positioning (role, audience, topics, tone) once; stored as system context.
2. **Idea board:** "Generate 10 ideas" button → Claude API produces hooks across formats (story, contrarian, how-to, lessons, listicle) tagged by topic pillar. Save/dismiss ideas.
3. **Draft generator:** pick idea → 3 draft variants in user's tone, LinkedIn-formatted (hook line, whitespace rhythm, no hashtag spam, CTA line). Regenerate per-section (hook only / body only).
4. **Editor:** side-by-side edit with live LinkedIn preview (line-break-accurate desktop/mobile preview).
5. **Graphics:** template-based quote/carousel cards (satori or html-to-image) with 2-3 editable branded templates — text on card, export PNG. NOT AI image gen in MVP.
6. **Content calendar:** drag drafts onto week view; statuses idea → drafted → ready → posted (manual mark). **NO auto-posting in MVP** — user copies text + downloads image. (LinkedIn API posting = later phase; requires app review.)
7. Post history with performance notes field (manual impressions entry) → feeds "what worked" into future idea generation.

## Stack
Next.js 15, Tailwind v4, shadcn, Payload or Postgres+Drizzle, Anthropic SDK (`claude-sonnet-5` for generation, `claude-haiku-4-5-20251001` for idea batches), satori for cards, Vercel.

## Data model
users(profile_context json) · ideas(text, format, pillar, status) · drafts(idea_id, variants json, final_text, image_url, scheduled_date, status) · templates(brand config json)

## Case-study angle
"Shipped an AI content system I use every day — from blank page to 5 posts/week." Show idea board, preview accuracy, card templates. Metrics after a month of use: posts published, time per post before/after.
