import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Seeds the writing archive so /writing is a real page rather than a 404.
 *
 * Every post is drawn from work Jerome has actually done (the AngularJS→16
 * migration with a 25-engineer offshore team, the freelance React/AI practice
 * since Feb 2025, the move to Germany) — nothing here invents a credential.
 * They are starting drafts: edit or unpublish any of them in /backstage.
 *
 * German copy is AI-drafted, so every post carries needsGermanReview.
 * Idempotent — matches on slug and updates in place.
 *
 * Run: pnpm payload run src/seed/seedPosts.ts
 */

const rt = (...paragraphs: string[]) => ({
  root: {
    type: 'root' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      version: 1,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      textFormat: 0,
      children: [{ type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
    })),
  },
})

const POSTS = [
  {
    slug: 'migrating-angularjs-to-angular-16',
    publishedDate: '2026-05-18T09:00:00.000Z',
    tags: ['Angular', 'Migration', 'Micro frontends'],
    en: {
      title: 'Migrating a B2B platform from AngularJS to Angular 16',
      summary:
        'What actually decides a large migration: not the framework upgrade, but how you slice the work so twenty-five engineers can ship in parallel without blocking each other.',
      body: [
        'The CPQ platform I worked on had been running on AngularJS for the better part of a decade. It worked. Sales teams used it daily, and nobody was allowed to stop using it while we replaced the engine underneath.',
        'The instinct on a migration like this is to plan a big rewrite and hold a launch date. That plan fails quietly: the codebase keeps moving while you rewrite it, and by the time the new version is ready it is already behind. What worked instead was slicing the application into micro frontends and moving one slice at a time, with both versions running side by side behind the same shell.',
        'Slicing is the real design work. A slice has to be small enough that a pair of engineers can finish it inside a sprint, and self-contained enough that it does not need three other slices to land first. Where the old app shared state freely, we had to draw a boundary and make the contract explicit before anything could move.',
        'With twenty-five engineers across time zones, the constraint was never typing speed — it was coordination. Every ambiguous boundary turned into a meeting, and every meeting cost a day. The slices that shipped fastest were the ones where the interface was decided before the work started.',
        'The test strategy carried the risk. We held Jasmine/Karma coverage at 80% on migrated code, not because the number matters, but because it forced each slice to be testable in isolation — which is the same property that made it safe to ship on its own.',
      ],
    },
    de: {
      title: 'Migration einer B2B-Plattform von AngularJS zu Angular 16',
      summary:
        'Was eine große Migration wirklich entscheidet: nicht das Framework-Upgrade, sondern der Schnitt der Arbeit — so, dass 25 Engineers parallel liefern können, ohne sich gegenseitig zu blockieren.',
      body: [
        'Die CPQ-Plattform, an der ich gearbeitet habe, lief seit fast einem Jahrzehnt auf AngularJS. Sie funktionierte. Vertriebsteams nutzten sie täglich, und niemand durfte sie stoppen, während wir den Motor darunter austauschten.',
        'Der Reflex bei so einer Migration ist ein großer Rewrite mit festem Launch-Termin. Dieser Plan scheitert leise: Die Codebase bewegt sich weiter, während man sie neu schreibt. Was stattdessen funktioniert hat: die Anwendung in Micro Frontends schneiden und Stück für Stück migrieren — beide Versionen liefen parallel hinter derselben Shell.',
        'Der Schnitt ist die eigentliche Designarbeit. Ein Stück muss klein genug sein, dass zwei Engineers es in einem Sprint fertigstellen, und eigenständig genug, dass es nicht auf drei andere Stücke wartet. Wo die alte App Zustand frei geteilt hat, mussten wir eine Grenze ziehen und den Vertrag explizit machen.',
        'Mit 25 Engineers über Zeitzonen hinweg war die Beschränkung nie die Tippgeschwindigkeit, sondern die Abstimmung. Jede unklare Grenze wurde zu einem Meeting, jedes Meeting kostete einen Tag. Am schnellsten waren die Stücke, deren Schnittstelle vor Beginn der Arbeit feststand.',
        'Die Teststrategie trug das Risiko. Wir hielten die Jasmine/Karma-Abdeckung auf migriertem Code bei 80% — nicht wegen der Zahl, sondern weil sie jedes Stück isoliert testbar machte. Genau diese Eigenschaft machte es sicher, einzeln zu deployen.',
      ],
    },
  },
  {
    slug: 'what-changes-when-you-go-freelance',
    publishedDate: '2026-06-22T09:00:00.000Z',
    tags: ['Freelance', 'React', 'Practice'],
    en: {
      title: 'What changed when I went from enterprise Angular to freelance React',
      summary:
        'Five and a half years inside a large delivery organisation taught me one set of habits. Working directly with founders taught me which of them were load-bearing.',
      body: [
        'In an enterprise delivery team, the work arrives shaped. Someone has already decided what is being built and why; your job is to build it well, at scale, without breaking the things around it. That is a real skill, and it is not the same skill as deciding what to build.',
        'Since February 2025 I have worked directly with founders and small businesses. The brief now arrives as a problem, not a ticket. A restaurant group does not ask for a booking flow — they ask why the phone rings all evening. Half the value is in translating that into something buildable, and the translation is my job now too.',
        'The technical habits that survived the switch were the boring ones: type everything, keep the boundaries explicit, write the test that would have caught it. The habits that did not survive were the ceremonial ones — the estimates nobody used, the documents written for an audience that never read them.',
        'The thing I underestimated was scope. On a small project there is no product manager standing between an idea and the codebase, so scope moves every week unless you hold it. Saying no to a feature is now part of the work, not an escalation.',
        'What I kept from the enterprise years is a tolerance for systems that have to keep running. Enterprise code is not glamorous, but it teaches you that shipping is not the end of the job — the thing has to survive Monday morning without you.',
      ],
    },
    de: {
      title: 'Was sich änderte: von Enterprise-Angular zu freiberuflichem React',
      summary:
        'Fünfeinhalb Jahre in einer großen Delivery-Organisation haben mir bestimmte Gewohnheiten beigebracht. Die Arbeit direkt mit Gründern hat gezeigt, welche davon wirklich tragen.',
      body: [
        'In einem Enterprise-Team kommt die Arbeit fertig geschnitten an. Jemand hat bereits entschieden, was gebaut wird und warum; deine Aufgabe ist, es gut zu bauen, skalierbar, ohne das Umfeld zu brechen. Das ist eine echte Fähigkeit — aber nicht dieselbe wie zu entscheiden, was gebaut werden soll.',
        'Seit Februar 2025 arbeite ich direkt mit Gründern und kleinen Unternehmen. Das Briefing kommt jetzt als Problem, nicht als Ticket. Eine Restaurantgruppe fragt nicht nach einem Buchungsflow — sie fragt, warum den ganzen Abend das Telefon klingelt. Die Hälfte des Werts liegt in der Übersetzung, und die Übersetzung ist jetzt auch meine Aufgabe.',
        'Überlebt haben die langweiligen technischen Gewohnheiten: alles typisieren, Grenzen explizit halten, den Test schreiben, der den Fehler gefunden hätte. Nicht überlebt haben die zeremoniellen — Schätzungen, die niemand nutzte, Dokumente für ein Publikum, das nie las.',
        'Unterschätzt habe ich den Scope. In einem kleinen Projekt steht kein Product Manager zwischen Idee und Codebase, also verschiebt sich der Scope jede Woche, wenn man ihn nicht hält. Nein zu einem Feature zu sagen, ist jetzt Teil der Arbeit.',
        'Aus den Enterprise-Jahren geblieben ist die Geduld für Systeme, die weiterlaufen müssen. Enterprise-Code ist nicht glamourös, aber er lehrt: Ausliefern ist nicht das Ende — das Ding muss den Montagmorgen ohne dich überstehen.',
      ],
    },
  },
  {
    slug: 'ai-tools-that-earn-their-place',
    publishedDate: '2026-07-30T09:00:00.000Z',
    tags: ['AI', 'Automation', 'Product'],
    en: {
      title: 'AI features that earn their place in a small product',
      summary:
        'Most "add AI" requests are really requests to remove a manual step. That reframing decides whether the feature is worth building.',
      body: [
        'Almost every AI request I get starts the same way: someone has seen a demo and wants one. The useful question is not which model to call — it is which manual step currently costs them an hour a week.',
        'Once the question is framed that way, the design gets much smaller. A model that drafts the first version of something a human already writes every day is worth building. A model that invents content nobody asked for is a liability, because someone now has to check it.',
        'The part that decides whether it ships is the failure mode. A drafting feature can be wrong and still be useful, because the human is already in the loop reviewing it. A feature that acts without review has to be right, and "usually right" is not a specification you can hand to a small business.',
        'Practically, that means most of the engineering is not prompt work. It is the boring scaffolding: keeping the request cheap, caching what does not change, making the output editable, and leaving an obvious path back to doing it by hand when the model is unavailable.',
        'The tools that stayed in use after a month were the ones where the person could see exactly what the model did and change it. The ones that got switched off were the ones that felt like a black box, regardless of how good the output was.',
      ],
    },
    de: {
      title: 'KI-Features, die sich in einem kleinen Produkt verdienen',
      summary:
        'Die meisten „Mach was mit KI"-Anfragen sind eigentlich der Wunsch, einen manuellen Schritt loszuwerden. Diese Umdeutung entscheidet, ob das Feature es wert ist.',
      body: [
        'Fast jede KI-Anfrage beginnt gleich: Jemand hat eine Demo gesehen und möchte auch eine. Die nützliche Frage ist nicht, welches Modell man aufruft — sondern welcher manuelle Schritt gerade eine Stunde pro Woche kostet.',
        'So gestellt, wird das Design deutlich kleiner. Ein Modell, das die erste Fassung von etwas schreibt, das ein Mensch ohnehin täglich schreibt, lohnt sich. Ein Modell, das Inhalte erfindet, nach denen niemand gefragt hat, ist ein Risiko — jemand muss sie jetzt prüfen.',
        'Ob es live geht, entscheidet der Fehlerfall. Ein Entwurfs-Feature darf falsch liegen und bleibt nützlich, weil der Mensch ohnehin prüft. Ein Feature, das ohne Prüfung handelt, muss richtig sein — und „meistens richtig" ist keine Spezifikation, die man einem kleinen Unternehmen übergibt.',
        'Praktisch heißt das: Der Großteil der Arbeit ist kein Prompt-Engineering, sondern das langweilige Drumherum — Anfragen günstig halten, Unveränderliches cachen, Ausgaben editierbar machen und einen offensichtlichen Weg zurück zur Handarbeit lassen, wenn das Modell nicht verfügbar ist.',
        'Nach einem Monat in Benutzung blieben die Tools, bei denen man genau sah, was das Modell getan hat, und es ändern konnte. Abgeschaltet wurden die, die sich wie eine Blackbox anfühlten — unabhängig von der Qualität der Ausgabe.',
      ],
    },
  },
]

const payload = await getPayload({ config })

for (const post of POSTS) {
  const existing = await payload.find({
    collection: 'posts',
    where: { slug: { equals: post.slug } },
    limit: 1,
    locale: 'en',
  })

  const base = {
    slug: post.slug,
    publishedDate: post.publishedDate,
    tags: post.tags.map((tag) => ({ tag })),
    needsGermanReview: true,
    _status: 'published' as const,
  }

  const id =
    existing.docs[0]?.id ??
    (
      await payload.create({
        collection: 'posts',
        locale: 'en',
        data: {
          ...base,
          title: post.en.title,
          summary: post.en.summary,
          body: rt(...post.en.body),
        },
      })
    ).id

  if (existing.docs[0]) {
    await payload.update({
      collection: 'posts',
      id,
      locale: 'en',
      data: {
        ...base,
        title: post.en.title,
        summary: post.en.summary,
        body: rt(...post.en.body),
      },
    })
  }

  await payload.update({
    collection: 'posts',
    id,
    locale: 'de',
    data: {
      ...base,
      title: post.de.title,
      summary: post.de.summary,
      body: rt(...post.de.body),
    },
  })

  payload.logger.info(`post seeded: ${post.slug}`)
}

process.exit(0)
