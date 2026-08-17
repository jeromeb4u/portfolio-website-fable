/**
 * Soft warm dot used as the point sprite for every particle in the hero
 * portrait scene (portrait cloud and ambient dust alike). One cached canvas
 * texture is far cheaper than a per-particle gradient, and gives dots a round
 * glow instead of a flat square.
 *
 * The stops are the reference scene's: a white core that falls off through a
 * warm cream to a transparent amber edge, so additive blending stacks into
 * neutral highlights rather than a saturated orange haze.
 */
export function createGlowSprite(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.3, 'rgba(255,225,180,.8)')
    grad.addColorStop(1, 'rgba(255,190,130,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)
  }
  return canvas
}
