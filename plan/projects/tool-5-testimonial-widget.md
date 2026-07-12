# Tool 5 — Vouch: testimonial collector + embeddable wall

**Type:** Micro-SaaS (polished product) · **Effort:** ~3-4 weeks (most "productized" of the five)

## Problem
Small businesses/freelancers want social proof but collecting testimonials is awkward and displaying them means custom code. Senja/Testimonial.to charge $25+/mo.

## Target user
Freelancers, agencies, coaches, local businesses. (Also: Jerome collects his own client testimonials with it → portfolio recommendations section grows.)

## MVP features
1. **Collection form:** per-project shareable link (`vouch.app/f/slug`) — client writes text testimonial, star rating, name/title/company, optional photo. Custom thank-you message. No client account needed.
2. **AI assist for the giver:** "help me write" — client answers 3 guided questions, AI composes testimonial they can edit/approve (kills blank-page problem; consent explicit via approval step).
3. **Dashboard:** approve/hide, tag, feature testimonials.
4. **Embeddable wall + single-quote widgets:** one `<script>` embed (iframe, theme-able light/dark/brand color, layout: wall/carousel/single). Sub-15KB loader. Also framework-free copy-paste HTML export for static sites.
5. **Import:** paste existing LinkedIn recommendation / email text manually with source label.

## Stack
Next.js 15, Tailwind v4, shadcn, Postgres+Drizzle, Anthropic SDK (`claude-haiku-4-5-20251001` for the writing assist), Vercel Blob (photos), widget = separate tiny vanilla-TS bundle (tsup) served from `/widget.js`, auth better-auth/Clerk.

## Hard requirements
- Widget isolation: iframe embed, no style bleed, CSP-safe, lazy loads.
- GDPR: photo + name consent checkbox on the collection form (German market!), delete-my-testimonial link in widget footer, data-processing note.

## Case-study angle
"A full micro-SaaS: multi-tenant collection, AI-assisted UX, and a 15KB embeddable widget." Shows productization end-to-end: auth, tenancy, embeds, GDPR. Live demo wall embedded IN the case study page itself.
