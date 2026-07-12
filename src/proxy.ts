import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Locale routing applies to the public site only — never to the Payload
  // admin (/backstage), Payload REST/GraphQL (/api), Next internals, or files.
  matcher: ['/((?!api|backstage|_next|_vercel|.*\\..*).*)'],
}
