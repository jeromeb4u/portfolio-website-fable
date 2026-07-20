# Case Study Intake Template

Fill this out per project, then paste the finished doc into `/backstage` (Case Studies
collection) or hand it to Claude to add via `src/seed/seed.ts`. One template = one
case study. Every `localized` field needs an EN value at minimum; add DE only when
you have real German copy — never machine-translate filler.

Fields marked **required** must be filled before the study can be published.

---

## title (required, localized)
EN:
DE:

## slug (required)
kebab-case, stable across locales, used in the URL (`/work/<slug>`):

## projectType (required)
One of: `ai-tool` | `dev-tool` | `automation` | `micro-saas` | `client-work`

## summary (required, localized)
1-2 sentences — shown on the card when no metrics exist.
EN:
DE:

## coverImage (required)
Path or description of the image to upload in `/backstage` (Media collection):

## coverVideo (optional)
Short muted loop (mp4/webm) played on card hover:

## liveUrl (optional)
Skip if `confidential` is checked — it will not render regardless.

## repoUrl (optional)
Skip if `confidential` is checked — it will not render regardless.

## stack (optional, repeatable)
- tech:
- tech:
- tech:

## year (required)
YYYY:

## role (optional, localized)
EN:
DE:

## body (optional, localized richText)
Full write-up — paste as plain text/markdown-ish; format in the Payload rich text
editor in `/backstage`.
EN:
DE:

## metrics (optional, repeatable, localized labels)
Shown as the card's headline stat instead of the summary when present.
- value: | label EN: | label DE:
- value: | label EN: | label DE:

## needsGermanReview
Check this if the DE copy above is AI-drafted and not yet proofread by a native
speaker. Leave unchecked once a human has reviewed it.

## order
Lower numbers appear first on `/work` and the homepage grid. Default 0.

## featured
Checked = shown on the homepage Work grid. Unfeatured studies still appear on `/work`.
Default: checked.

## confidential
Checked = NDA'd client work. Shows a "confidential" badge, suppresses live/repo
links regardless of whether `liveUrl`/`repoUrl` are filled in. Default: unchecked.
