import * as THREE from 'three'

import { createGlowSprite } from './glowSprite'
import { planeFragmentShader, planeVertexShader } from './particleShaders'

/*
 * WebGL hero portrait — the three.js scene that fills the whole hero section
 * and bleeds off its right edge.
 *
 * Framework-free on purpose: the component layer (HeroParticleScene) only
 * decides *whether* to run this, mounts a host element, and disposes it. All
 * the scene state lives in this closure.
 *
 * Interactions:
 *   - hover : a soft circular window reveals the real photograph under the
 *             cursor, and nearby particles are pushed outward
 *   - click : the whole portrait resolves for 3.2s, then fades back
 *   - scroll: the cloud sinks, dims, and falls back apart into its scattered
 *             start — so the hero dissolves as the next section arrives
 * Hover and click are gated off until the intro settles and while the page is
 * scrolled, so they never fight the scroll-away.
 */

/** Offscreen sampling resolution for the portrait. One candidate per pixel, so
 *  this sets the grain: a finer grid gives smaller, more numerous dots. */
const TEX = 430
/** Portrait plane size in world units. */
const PLANE_W = 11
const PLANE_H = 11.6
/** Square crop taken out of the source photo, as fractions of its own size.
 *  Tuned so Jerome's head lands centred inside the ellipse below. */
const CROP_X = 0.092
const CROP_Y = 0.027
const CROP_SIDE = 0.72
/** Ellipse that crops the head out of the photo. */
const ELL_RX = 0.46
const ELL_RY = 0.52
const ELL_CY = 0.02
/** Luminance below this emits no particle — the studio backdrop reads ~0.10,
 *  comfortably under the floor, so only the lit face and hair survive. */
const LUMA_FLOOR = 0.17
/** Luminance at (and above) which the stipple reaches full density. Pulling the
 *  ceiling well below pure white means the highlights actually saturate instead
 *  of only the few brightest specular pixels. */
const LUMA_CEIL = 0.70
/**
 * Tone is carried by DENSITY, not by per-dot brightness — the difference
 * between a stipple engraving and a flat dusting.
 *
 * The old sampler kept ~99.5% of every pixel above the floor and varied each
 * dot's colour instead, so shadow and highlight held the same number of points
 * and the face read as one grey mass. Here the keep-probability *is* the tonal
 * value, so eye sockets and the jaw shadow thin out to bare canvas while the
 * brow and cheek pack solid, and the dots themselves stay near-uniform.
 *
 * Gamma > 1 darkens the mid-tones, which is what gives the reference its hard
 * separation between lit and unlit planes.
 */
const TONE_GAMMA = 1.55
/** Dot brightness range. Narrow at the bottom so shadow dots stay quiet, but
 *  lifted at the top: under additive blending the packed highlight areas need
 *  to bloom toward white, which is what gives the reference its lit look. */
const GLOW_MIN = 0.70
const GLOW_MAX = 1.85
/** Ambient dust motes drifting across the whole scene. */
const DUST_COUNT = 300

function smoothstep01(x: number): number {
  const c = Math.max(0, Math.min(1, x))
  return c * c * (3 - 2 * c)
}

/**
 * Builds the scene inside `host` and starts its animation loop.
 * Returns a teardown function that cancels the loop, unbinds listeners and
 * disposes every GPU resource.
 */
export function createParticlePortrait(host: HTMLElement, src: string): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  // ACES filmic tone mapping keeps the additive warm sprite from blowing out
  // into amber; without it the cloud loses its neutral grey-white highlights.
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(host.clientWidth, host.clientHeight, false)
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  // The canvas spans the hero, so it must not swallow clicks on the copy;
  // pointer state is read from window listeners instead.
  renderer.domElement.style.pointerEvents = 'none'
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    60,
    host.clientWidth / Math.max(1, host.clientHeight),
    0.1,
    100,
  )
  camera.position.set(0, 0, 14)

  const sprite = new THREE.CanvasTexture(createGlowSprite())

  // --- ambient dust ---------------------------------------------------------
  const dustGeo = new THREE.BufferGeometry()
  const dustPos = new Float32Array(DUST_COUNT * 3)
  const dustSpeed = new Float32Array(DUST_COUNT)
  for (let i = 0; i < DUST_COUNT; i += 1) {
    dustPos[3 * i] = (Math.random() - 0.5) * 40
    dustPos[3 * i + 1] = (Math.random() - 0.5) * 24
    dustPos[3 * i + 2] = (Math.random() - 0.5) * 16
    dustSpeed[i] = 0.1 + 0.4 * Math.random()
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dustMat = new THREE.PointsMaterial({
    size: 0.16,
    map: sprite,
    transparent: true,
    color: new THREE.Color('#f5d6a0'),
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const dust = new THREE.Points(dustGeo, dustMat)
  scene.add(dust)

  // --- portrait group -------------------------------------------------------
  const group = new THREE.Group()
  group.position.set(6.2, 0.3, 0)
  scene.add(group)

  let points: THREE.Points | null = null
  let plane: THREE.Mesh | null = null
  let shader: THREE.ShaderMaterial | null = null
  let targetPos: Float32Array | null = null
  let scatterPos: Float32Array | null = null
  let edge: Float32Array | null = null
  let count = 0
  let ready = false

  const raycaster = new THREE.Raycaster()
  const pointerNdc = new THREE.Vector2(-2, -2)
  const clickNdc = new THREE.Vector2(-2, -2)
  const cursorWorld = new THREE.Vector2(0, 0)
  const mouse = { x: 0, y: 0 }
  let activeSmooth = 0
  let fullSmooth = 0
  let fullOn = false
  let fullStart = -99
  let clickPending = false

  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.onload = () => {
    const sampler = document.createElement('canvas')
    sampler.width = TEX
    sampler.height = TEX
    const sctx = sampler.getContext('2d')
    if (!sctx) return
    const side = CROP_SIDE * Math.min(image.width, image.height)
    sctx.drawImage(image, CROP_X * image.width, CROP_Y * image.height, side, side, 0, 0, TEX, TEX)

    let data: Uint8ClampedArray
    try {
      data = sctx.getImageData(0, 0, TEX, TEX).data
    } catch {
      return
    }

    const pos: number[] = []
    const scatter: number[] = []
    const colors: number[] = []
    const edges: number[] = []

    for (let y = 0; y < TEX; y += 1) {
      for (let x = 0; x < TEX; x += 1) {
        const i = (TEX * y + x) * 4
        const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255
        const nx = x / TEX - 0.5
        const ny = y / TEX - 0.5
        const ell =
          (nx / ELL_RX) * (nx / ELL_RX) + ((ny + ELL_CY) / ELL_RY) * ((ny + ELL_CY) / ELL_RY)
        if (lum < LUMA_FLOOR || ell >= 1) continue

        // Tonal value across the usable luminance band, eased at both ends so
        // the floor does not cut a hard silhouette edge into the shadows.
        const tone = smoothstep01((lum - LUMA_FLOOR) / (LUMA_CEIL - LUMA_FLOOR))

        const u = Math.max(0, (ell - 0.5) / 0.5)
        // Density = tone, still falling off toward the ellipse edge so the
        // portrait dissolves into the surrounding dust rather than stopping.
        if (Math.random() > Math.pow(tone, TONE_GAMMA) * (1 - 0.45 * u)) continue

        const jitter = u * u * 2
        pos.push(
          PLANE_W * nx + (Math.random() - 0.5) * jitter,
          -(PLANE_H * ny) + (Math.random() - 0.5) * jitter,
          (Math.random() - 0.5) * (0.18 + 0.5 * jitter),
        )
        edges.push(u)

        const g = GLOW_MIN + (GLOW_MAX - GLOW_MIN) * tone
        colors.push(g, g, g)

        const rx = 2 * Math.random() - 1
        const ry = 2 * Math.random() - 1
        const rz = 2 * Math.random() - 1
        const len = Math.hypot(rx, ry, rz) || 1
        const dist = 4 + 16 * Math.random()
        scatter.push((rx / len) * dist, (ry / len) * dist + 4, (rz / len) * dist)
      }
    }

    count = pos.length / 3
    targetPos = new Float32Array(pos)
    scatterPos = new Float32Array(scatter)
    edge = new Float32Array(edges)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(reduced ? pos.slice() : scatter.slice(), 3),
    )
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    const mat = new THREE.PointsMaterial({
      // Smaller than the old 0.062 to match the finer TEX grid — oversized dots
      // would merge back into the blur that density is meant to resolve.
      size: 0.042,
      map: sprite,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    points = new THREE.Points(geo, mat)
    points.renderOrder = 1
    group.add(points)

    const tex = new THREE.CanvasTexture(sampler)
    tex.colorSpace = THREE.SRGBColorSpace
    shader = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uMap: { value: tex },
        uCursor: { value: new THREE.Vector2(0.5, 0.5) },
        uActive: { value: 0 },
        uRadius: { value: 0.17 },
        uFull: { value: 0 },
      },
      vertexShader: planeVertexShader,
      fragmentShader: planeFragmentShader,
    })
    plane = new THREE.Mesh(new THREE.PlaneGeometry(PLANE_W, PLANE_H), shader)
    plane.position.set(0, 0, -0.3)
    plane.renderOrder = 0
    group.add(plane)
    ready = true
  }
  image.src = src

  const onMove = (e: MouseEvent) => {
    mouse.x = e.clientX / window.innerWidth - 0.5
    mouse.y = e.clientY / window.innerHeight - 0.5
    pointerNdc.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -((e.clientY / window.innerHeight) * 2 - 1),
    )
  }
  const onClick = (e: MouseEvent) => {
    clickNdc.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -((e.clientY / window.innerHeight) * 2 - 1),
    )
    clickPending = true
  }
  if (!reduced) {
    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick)
  }

  const onResize = () => {
    const w = host.clientWidth
    const h = host.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / Math.max(1, h)
    camera.updateProjectionMatrix()
  }
  window.addEventListener('resize', onResize)

  const clock = new THREE.Clock()
  let raf = 0

  const frame = () => {
    const t = clock.getElapsedTime()
    const mx = reduced ? 0 : mouse.x
    const my = reduced ? 0 : mouse.y

    // ambient dust drifts upward and wraps
    for (let i = 0; i < DUST_COUNT; i += 1) {
      dustPos[3 * i + 1] += 0.01 * dustSpeed[i]
      if (dustPos[3 * i + 1] > 12) dustPos[3 * i + 1] = -12
    }
    dustGeo.attributes.position.needsUpdate = true
    dust.rotation.y = 0.015 * t

    if (ready && points && targetPos && scatterPos && edge) {
      const intro = reduced ? 1 : smoothstep01(t / 2.6)
      const scrollF = Math.min(1, (window.scrollY || 0) / (0.8 * window.innerHeight))

      if (!reduced && plane && shader) {
        let hit = false
        if (intro > 0.6 && scrollF < 0.5) {
          raycaster.setFromCamera(pointerNdc, camera)
          const hits = raycaster.intersectObject(plane)
          if (hits.length && hits[0].uv) {
            hit = true
            const uv = hits[0].uv
            shader.uniforms.uCursor.value.set(uv.x, uv.y)
            cursorWorld.set((uv.x - 0.5) * PLANE_W, (uv.y - 0.5) * PLANE_H)
          }
        }
        activeSmooth += ((hit ? 1 : 0) - activeSmooth) * (hit ? 0.18 : 0.1)
        shader.uniforms.uActive.value = activeSmooth * (1 - scrollF)

        if (clickPending) {
          clickPending = false
          if (intro > 0.6 && scrollF < 0.5) {
            raycaster.setFromCamera(clickNdc, camera)
            const hits = raycaster.intersectObject(plane)
            if (hits.length && hits[0].uv) {
              const ux = (hits[0].uv.x - 0.5) / ELL_RX
              const uy = (hits[0].uv.y - 0.5) / ELL_RY
              if (ux * ux + uy * uy < 1.05) {
                fullOn = true
                fullStart = t
              }
            }
          }
        }

        let fullTarget = 0
        if (fullOn) {
          const age = t - fullStart
          fullTarget = age < 3.2 ? 1 : 0
          if (age > 4.4) fullOn = false
        }
        fullSmooth += (fullTarget - fullSmooth) * 0.1
        shader.uniforms.uFull.value = fullSmooth * (1 - scrollF)
      }

      const cx = cursorWorld.x
      const cy = cursorWorld.y
      const active = activeSmooth
      const arr = points.geometry.attributes.position.array as Float32Array
      const bob = reduced ? 0 : 0.03 * Math.sin(0.9 * t)
      const morph = intro * (1 - scrollF) * (1 - fullSmooth)

      for (let i = 0; i < count; i += 1) {
        const n = 3 * i
        const u = edge[i]
        const amp = reduced ? 0 : 0.02 + u * u * 0.55
        const wx = Math.sin(0.8 * t + 0.7 * i) * amp
        const wy = Math.cos(t + 1.3 * i) * amp
        const wz = Math.sin(0.6 * t + 0.5 * i) * amp

        let px = scatterPos[n] + (targetPos[n] - scatterPos[n]) * morph + wx * morph
        let py =
          scatterPos[n + 1] +
          (targetPos[n + 1] - scatterPos[n + 1]) * morph +
          (bob + wy) * morph
        const pz =
          scatterPos[n + 2] + (targetPos[n + 2] - scatterPos[n + 2]) * morph + wz * morph

        // particles flee the cursor
        if (active > 0.001) {
          const dx = px - cx
          const dy = py - cy
          const d = Math.hypot(dx, dy) || 1
          if (d < 2.4) {
            const push = (1 - d / 2.4) * 2.6 * active
            px += (dx / d) * push
            py += (dy / d) * push
          }
        }

        arr[n] = px
        arr[n + 1] = py
        arr[n + 2] = pz
      }
      points.geometry.attributes.position.needsUpdate = true
      ;(points.material as THREE.PointsMaterial).opacity =
        Math.min(1, 1.3 * intro) * (1 - 0.8 * scrollF) * (1 - 0.82 * fullSmooth)

      group.rotation.y = 0.18 * mx
      group.rotation.x = 0.1 * my
      group.position.y = 0.3 - 3 * scrollF
    }

    camera.position.x += (2 * mx - camera.position.x) * 0.04
    camera.position.y += (-(1.4 * my) - camera.position.y) * 0.04
    camera.lookAt(0.8, 0.3, 0)

    renderer.render(scene, camera)
    raf = window.requestAnimationFrame(frame)
  }
  raf = window.requestAnimationFrame(frame)

  return () => {
    window.cancelAnimationFrame(raf)
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('click', onClick)
    window.removeEventListener('resize', onResize)
    renderer.dispose()
    dustGeo.dispose()
    dustMat.dispose()
    sprite.dispose()
    points?.geometry.dispose()
    ;(points?.material as THREE.Material | undefined)?.dispose()
    plane?.geometry.dispose()
    shader?.dispose()
    if (renderer.domElement.parentNode === host) {
      host.removeChild(renderer.domElement)
    }
  }
}
