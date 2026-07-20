'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { createGlowSprite } from '@/lib/glowSprite'
import {
  dotsVertexShader,
  dotsFragmentShader,
  dustVertexShader,
  dustFragmentShader,
  planeVertexShader,
  planeFragmentShader,
} from '@/lib/particleShaders'

/**
 * WebGL hero particle portrait — real three.js point-sprites + a
 * shader-driven reveal plane, not a 2D-canvas approximation. Original scene
 * architecture (orthographic camera sized to the panel's own CSS pixels, so
 * world-space coordinates equal on-screen pixels 1:1 — no raycasting needed
 * for the pointer, and portrait sampling reuses plain pixel math):
 *
 *  - An adaptive luminance threshold (this photo's own histogram, brightest
 *    ~23%) samples the portrait into a point cloud — a fixed cutoff is
 *    fragile against a studio backdrop that isn't pure black.
 *  - Point positions are recomputed from a fixed home position every vertex
 *    shader invocation (see particleShaders.ts) — shaders are inherently
 *    stateless per frame, so the pointer-repulsion can't accumulate jitter.
 *  - A separate shader plane reveals the crisp photo: hover opens a soft
 *    circular lens gated by luminance (shadows stay hidden), click reveals
 *    the whole frame with the gate relaxed, both smoothstep-soft-edged.
 *  - Particles assemble in from a scattered start on first paint.
 *
 * Reduced-motion / no-WebGL: a plain masked <img>, no canvas, no rAF.
 */
const DOT_COLOR = '255,224,188' // warm, additively blended → glowing embers
const DUST_COLOR = '245,214,160'
const GAP = 4.5
const TARGET_COVERAGE = 0.23
const HOVER_RADIUS_FRAC = 0.24 // of min(W,H), clamped below
const FULL_HOLD_MS = 3200
const INTRO_MS = 2600
const CAM_DIST = 900 // camera z; world units ≈ CSS px at the portrait plane
const MAX_TILT = 0.16 // parallax cloud-tilt, radians

function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

function adaptiveThreshold(data: Uint8ClampedArray, targetFraction: number) {
  const bins = new Array(256).fill(0)
  let total = 0
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    bins[Math.min(255, lum | 0)]++
    total++
  }
  const targetCount = total * targetFraction
  let cum = 0
  for (let b = 255; b >= 0; b--) {
    cum += bins[b]
    if (cum >= targetCount) return b / 255
  }
  return 0.5
}

export function HeroParticleScene({ src, className }: { src: string; className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'pending' | 'webgl' | 'fallback'>('pending')

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Phones don't run the sim: below the md breakpoint we serve the static
    // masked image instead — no WebGL context, no rAF, no battery drain, and
    // no full-screen canvas competing with touch-scroll.
    const mobile = window.matchMedia('(max-width: 767px)').matches
    setMode(!reduce && !mobile && supportsWebGL() ? 'webgl' : 'fallback')
  }, [])

  return (
    <div ref={mountRef} className={className}>
      {mode === 'webgl' && <Scene src={src} mount={mountRef} />}
      {mode === 'fallback' && <StaticFallback src={src} />}
    </div>
  )
}

function StaticFallback({ src }: { src: string }) {
  return (
    <div
      aria-hidden="true"
      className="h-full w-full"
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: '50% 22%',
        filter: 'saturate(0.9) contrast(1.05) brightness(1.02) grayscale(0.25)',
        WebkitMaskImage: 'radial-gradient(ellipse 62% 68% at 50% 45%, #000 55%, transparent 82%)',
        maskImage: 'radial-gradient(ellipse 62% 68% at 50% 45%, #000 55%, transparent 82%)',
      }}
    />
  )
}

function Scene({ src, mount }: { src: string; mount: React.RefObject<HTMLDivElement | null> }) {
  const canvasHostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = canvasHostRef.current
    if (!host) return

    let W = 0
    let H = 0
    let raf = 0
    let running = false
    let disposed = false
    let introStart = performance.now()

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setClearColor(0x000000, 0)
    host.appendChild(renderer.domElement)
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;'

    const scene = new THREE.Scene()
    // Perspective (not orthographic) so the cloud has real depth and parallax.
    // Camera sits back at CAM_DIST and the fov is derived per-resize so world
    // units still ≈ CSS px at the portrait plane (z≈0).
    const camera = new THREE.PerspectiveCamera(45, 1, 1, 4000)
    camera.position.set(0, 0, CAM_DIST)

    // Everything lives in one group so parallax is a single tilt of the group
    // toward the cursor; the camera stays put, keeping the raycast stable.
    const group = new THREE.Group()
    scene.add(group)

    const dotSprite = new THREE.CanvasTexture(createGlowSprite(28, DOT_COLOR))
    const dustSprite = new THREE.CanvasTexture(createGlowSprite(28, DUST_COLOR))

    // Portrait dots — warm-tinted, normal-blended. (Additive was tried and
    // reverted: over the dark panel it blooms every dot into a uniform haze
    // and erases the tonal contrast the face needs to read.)
    const dotsGeo = new THREE.BufferGeometry()
    const dotsMat = new THREE.ShaderMaterial({
      vertexShader: dotsVertexShader,
      fragmentShader: dotsFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uIntro: { value: 0 },
        uCursor: { value: new THREE.Vector2(-99999, -99999) },
        uHoverRadius: { value: 110 },
        uHoverAmt: { value: 0 },
        uPointScale: { value: 1 },
        uFocal: { value: CAM_DIST },
        uSprite: { value: dotSprite },
        uFade: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending,
    })
    const dots = new THREE.Points(dotsGeo, dotsMat)
    dots.renderOrder = 1
    group.add(dots)

    // Ambient dust
    const dustGeo = new THREE.BufferGeometry()
    const dustMat = new THREE.ShaderMaterial({
      vertexShader: dustVertexShader,
      fragmentShader: dustFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpan: { value: 600 },
        uSprite: { value: dustSprite },
        uOpacity: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
    const dust = new THREE.Points(dustGeo, dustMat)
    dust.renderOrder = 0
    group.add(dust)

    // Reveal plane
    const planeMat = new THREE.ShaderMaterial({
      vertexShader: planeVertexShader,
      fragmentShader: planeFragmentShader,
      uniforms: {
        uMap: { value: null as THREE.Texture | null },
        uCursorWorld: { value: new THREE.Vector2(-99999, -99999) },
        uRadiusPx: { value: 110 },
        uHoverAmt: { value: 0 },
        uClickAmt: { value: 0 },
        uGateLo: { value: 0.05 },
        uGateHi: { value: 0.2 },
        uOpacity: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    })
    let plane: THREE.Mesh | null = null

    const pointer = { x: -99999, y: -99999, targetActive: 0, active: 0 }
    const click = { value: 0, until: 0 }
    let radius = 110

    // Pointer is tracked as NDC and raycast against the plane each frame, so
    // the cursor stays aligned with the dots even while the group is tilted by
    // parallax. `norm` (−0.5..0.5) drives the tilt itself.
    const ndc = new THREE.Vector2(-2, -2)
    const norm = new THREE.Vector2(0, 0)
    const raycaster = new THREE.Raycaster()

    function buildDust() {
      const span = Math.max(H * 1.4, 400)
      const count = Math.round((W * span) / 9000)
      const pos = new Float32Array(count * 3)
      const speed = new Float32Array(count)
      const phase = new Float32Array(count)
      const size = new Float32Array(count)
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * W * 1.1
        pos[i * 3 + 1] = (Math.random() - 0.5) * span
        pos[i * 3 + 2] = (Math.random() - 0.5) * 10
        speed[i] = 10 + Math.random() * 22
        phase[i] = Math.random()
        size[i] = 3 + Math.random() * 6
      }
      dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      dustGeo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1))
      dustGeo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
      dustGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
      dustMat.uniforms.uSpan.value = span
    }

    function buildPortrait(img: HTMLImageElement) {
      const iw = img.naturalWidth
      const ih = img.naturalHeight
      const scale = Math.max(W / iw, H / ih)
      const dx = (W - iw * scale) / 2
      const dy = (H - ih * scale) / 2

      const off = document.createElement('canvas')
      off.width = W
      off.height = H
      const octx = off.getContext('2d')!
      octx.drawImage(img, dx, dy, iw * scale, ih * scale)
      const data = octx.getImageData(0, 0, W, H).data

      const lumMin = adaptiveThreshold(data, TARGET_COVERAGE)
      const featherBand = Math.max(0.05, (1 - lumMin) * 0.3)

      const positions: number[] = []
      const starts: number[] = []
      const sizes: number[] = []
      const alphas: number[] = []
      const phases: number[] = []
      const amps: number[] = []

      for (let y = 0; y < H; y += GAP) {
        for (let x = 0; x < W; x += GAP) {
          const px = x | 0
          const py = y | 0
          const i = (py * W + px) * 4
          const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255
          if (lum < lumMin) continue
          const edgeT = Math.min(1, (lum - lumMin) / featherBand)
          if (Math.random() > edgeT ** 0.7) continue

          const nb = Math.min(1, (lum - lumMin) / (1 - lumMin))
          const edge = 1 - nb
          const jx = (Math.random() - 0.5) * GAP
          const jy = (Math.random() - 0.5) * GAP
          // screen px → group-local world (origin centered, +y up)
          const world = { x: x + jx - W / 2, y: H / 2 - (y + jy) }

          // depth: edge/hair dots sit further off the plane than face-core
          // dots, so the cloud has real volume the parallax tilt can reveal
          const z = (Math.random() - 0.5) * (8 + edge * 38)

          // dispersed start scattered through a 3D shell for the assemble-in
          const ang = Math.random() * Math.PI * 2
          const dist = 60 + Math.random() * 160
          const zang = (Math.random() - 0.5) * Math.PI

          positions.push(world.x, world.y, z)
          starts.push(
            Math.cos(ang) * dist,
            Math.sin(ang) * dist,
            Math.sin(zang) * dist - z,
          )
          sizes.push((0.5 + nb * 1.2) * 2.4)
          alphas.push(0.2 + nb * 0.78) // normal blend — full contrast face at rest
          phases.push(Math.random() * Math.PI * 2)
          amps.push(0.4 + edge * 1.6)
        }
      }

      dotsGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
      dotsGeo.setAttribute('aStart', new THREE.BufferAttribute(new Float32Array(starts), 3))
      dotsGeo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(sizes), 1))
      dotsGeo.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(alphas), 1))
      dotsGeo.setAttribute('aPhase', new THREE.BufferAttribute(new Float32Array(phases), 1))
      dotsGeo.setAttribute('aAmp', new THREE.BufferAttribute(new Float32Array(amps), 1))

      planeMat.uniforms.uGateLo.value = lumMin * 0.55
      planeMat.uniforms.uGateHi.value = lumMin * 1.7

      const revealCanvas = document.createElement('canvas')
      revealCanvas.width = W
      revealCanvas.height = H
      revealCanvas.getContext('2d')!.drawImage(off, 0, 0)
      const tex = new THREE.CanvasTexture(revealCanvas)
      tex.colorSpace = THREE.SRGBColorSpace
      planeMat.uniforms.uMap.value?.dispose()
      planeMat.uniforms.uMap.value = tex

      if (plane) group.remove(plane)
      const geo = new THREE.PlaneGeometry(W, H)
      plane = new THREE.Mesh(geo, planeMat)
      plane.position.z = -6 // just behind the dots so the lens reads as depth
      plane.renderOrder = 2
      group.add(plane)

      introStart = performance.now()
    }

    function resize() {
      const rect = host!.getBoundingClientRect()
      W = Math.max(1, Math.round(rect.width))
      H = Math.max(1, Math.round(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      renderer.setPixelRatio(dpr)
      renderer.setSize(W, H, false)
      // fov chosen so the visible height at the plane (z≈0) equals H px, so
      // world units map ~1:1 to screen px there and the pixel-based sampling
      // and radius stay valid
      camera.fov = 2 * Math.atan(H / 2 / CAM_DIST) * (180 / Math.PI)
      camera.aspect = W / H
      camera.updateProjectionMatrix()

      radius = Math.max(70, Math.min(170, Math.min(W, H) * HOVER_RADIUS_FRAC))
      dotsMat.uniforms.uHoverRadius.value = radius
      planeMat.uniforms.uRadiusPx.value = radius
      dotsMat.uniforms.uPointScale.value = 1.15 * dpr

      buildDust()
      if (img.complete && img.naturalWidth) buildPortrait(img)
    }

    const img = new Image()
    img.onload = () => {
      resize()
      start()
    }
    img.src = src

    function frame() {
      const now = performance.now()
      const introEase = smoothstep(0, INTRO_MS, now - introStart)

      pointer.active += (pointer.targetActive - pointer.active) * (pointer.targetActive ? 0.16 : 0.09)
      const hover = pointer.active * introEase

      const clickTarget = now < click.until ? 1 : 0
      click.value += (clickTarget - click.value) * 0.1
      const full = click.value * introEase

      const rect = host!.getBoundingClientRect()
      const scrollFade = 1 - Math.max(0, Math.min(1, -rect.top / (rect.height * 0.9)))

      // parallax: ease the group's tilt toward the pointer (camera stays put)
      const tiltY = pointer.active > 0.001 ? norm.x * 2 * MAX_TILT : 0
      const tiltX = pointer.active > 0.001 ? norm.y * 2 * MAX_TILT : 0
      group.rotation.y += (tiltY - group.rotation.y) * 0.05
      group.rotation.x += (tiltX - group.rotation.x) * 0.05

      // raycast the plane for the cursor in the group's local space, so the
      // dot repulsion and the reveal lens track the pointer through the tilt
      if (pointer.active > 0.001 && plane) {
        raycaster.setFromCamera(ndc, camera)
        const hit = raycaster.intersectObject(plane, false)[0]
        if (hit?.uv) {
          pointer.x = (hit.uv.x - 0.5) * W
          pointer.y = (hit.uv.y - 0.5) * H
        }
      }

      const time = now / 1000
      dotsMat.uniforms.uTime.value = time
      dotsMat.uniforms.uIntro.value = introEase
      dotsMat.uniforms.uHoverAmt.value = hover
      dotsMat.uniforms.uCursor.value.set(pointer.x, pointer.y)
      dotsMat.uniforms.uFade.value = (1 - 0.8 * full) * scrollFade

      dustMat.uniforms.uTime.value = time
      dustMat.uniforms.uOpacity.value = scrollFade

      planeMat.uniforms.uCursorWorld.value.set(pointer.x, pointer.y)
      planeMat.uniforms.uHoverAmt.value = hover * (1 - full)
      planeMat.uniforms.uClickAmt.value = full
      planeMat.uniforms.uOpacity.value = scrollFade

      renderer.render(scene, camera)
      raf = requestAnimationFrame(frame)
    }

    function smoothstep(e0: number, e1: number, x: number) {
      const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
      return t * t * (3 - 2 * t)
    }

    function start() {
      if (running || disposed) return
      running = true
      raf = requestAnimationFrame(frame)
    }
    function stop() {
      running = false
      cancelAnimationFrame(raf)
    }

    function track(e: PointerEvent) {
      const rect = host!.getBoundingClientRect()
      const lx = (e.clientX - rect.left) / rect.width
      const ly = (e.clientY - rect.top) / rect.height
      ndc.set(lx * 2 - 1, -(ly * 2 - 1))
      norm.set(lx - 0.5, ly - 0.5)
    }
    function onMove(e: PointerEvent) {
      track(e)
      pointer.targetActive = 1
    }
    function onLeave() {
      pointer.targetActive = 0
    }
    function onDown(e: PointerEvent) {
      track(e)
      pointer.targetActive = 1
      click.until = performance.now() + FULL_HOLD_MS
    }

    const ro = new ResizeObserver(() => resize())
    ro.observe(host)

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), {
      threshold: 0.05,
    })
    io.observe(host)

    renderer.domElement.addEventListener('pointermove', onMove)
    renderer.domElement.addEventListener('pointerleave', onLeave)
    renderer.domElement.addEventListener('pointerdown', onDown)

    return () => {
      disposed = true
      stop()
      ro.disconnect()
      io.disconnect()
      renderer.domElement.removeEventListener('pointermove', onMove)
      renderer.domElement.removeEventListener('pointerleave', onLeave)
      renderer.domElement.removeEventListener('pointerdown', onDown)
      dotsGeo.dispose()
      dustGeo.dispose()
      dotsMat.dispose()
      dustMat.dispose()
      planeMat.uniforms.uMap.value?.dispose()
      planeMat.dispose()
      dotSprite.dispose()
      dustSprite.dispose()
      if (plane) (plane.geometry as THREE.BufferGeometry).dispose()
      renderer.dispose()
      host.removeChild(renderer.domElement)
    }
  }, [src])

  return <div ref={canvasHostRef} className="h-full w-full" />
}
