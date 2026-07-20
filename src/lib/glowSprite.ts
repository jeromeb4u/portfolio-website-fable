/**
 * Small pre-rendered radial-gradient dot, reused via drawImage for every
 * particle in the hero portrait and the ambient starfield. A single cached
 * sprite is far cheaper than a per-particle canvas gradient, and gives dots
 * a soft round glow instead of a flat pixel/square look.
 */
export function createGlowSprite(size = 32, rgb = '221,214,198'): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const r = size / 2
  const g = ctx.createRadialGradient(r, r, 0, r, r, r)
  g.addColorStop(0, `rgba(${rgb},1)`)
  g.addColorStop(0.4, `rgba(${rgb},0.5)`)
  g.addColorStop(1, `rgba(${rgb},0)`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return c
}
