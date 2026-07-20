/**
 * GLSL for the hero particle portrait — original shaders. Two point clouds
 * (portrait dots, ambient dust) plus one shader-driven reveal plane.
 */

// Portrait dots — position is recomputed from `position` (home) every vertex
// shader invocation (no accumulated velocity/state), which keeps the
// pointer-repulsion smooth rather than jittery.
export const dotsVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntro;       // 0..1 assemble-in progress
  uniform vec2 uCursor;       // pointer, world space (px)
  uniform float uHoverRadius; // world units (px)
  uniform float uHoverAmt;    // 0..1 eased hover strength
  uniform float uPointScale;
  uniform float uFocal;       // camera distance — perspective size attenuation

  attribute vec3 aStart;      // dispersed offset used during the intro
  attribute float aSize;
  attribute float aAlpha;
  attribute float aPhase;
  attribute float aAmp;

  varying float vAlpha;

  void main() {
    vec3 base = position + aStart * (1.0 - uIntro);

    float wob = sin(uTime * 1.4 + aPhase) * aAmp * uIntro;
    base.x += wob;
    base.y += wob * 0.6;

    // repulsion in the group's local space (matches uCursor, which is set
    // from a raycast hit so it stays correct while the cloud tilts)
    vec2 toCursor = base.xy - uCursor;
    float dist = length(toCursor);
    if (dist < uHoverRadius && dist > 0.0001) {
      float push = (1.0 - dist / uHoverRadius) * uHoverRadius * 0.85 * uHoverAmt;
      base.xy += normalize(toCursor) * push;
    }

    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(base, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPointScale * (uFocal / -mv.z);
  }
`

export const dotsFragmentShader = /* glsl */ `
  precision mediump float;
  uniform sampler2D uSprite;
  uniform float uFade;
  varying float vAlpha;

  void main() {
    vec4 tex = texture2D(uSprite, gl_PointCoord);
    gl_FragColor = vec4(tex.rgb, tex.a * vAlpha * uFade);
  }
`

// Ambient dust — a slow vertical conveyor: each point travels up through a
// fixed band and wraps, phase-offset per point so the loop isn't visible.
export const dustVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpan;
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aSize;
  varying float vTwinkle;

  void main() {
    vec3 pos = position;
    float travel = mod(uTime * aSpeed + aPhase * uSpan, uSpan);
    pos.y = mod(pos.y - travel + uSpan * 0.5, uSpan) - uSpan * 0.5;
    vTwinkle = 0.5 + 0.5 * sin(uTime * 1.6 + aPhase);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (0.7 + 0.3 * vTwinkle);
  }
`

export const dustFragmentShader = /* glsl */ `
  precision mediump float;
  uniform sampler2D uSprite;
  uniform float uOpacity;
  varying float vTwinkle;

  void main() {
    vec4 tex = texture2D(uSprite, gl_PointCoord);
    gl_FragColor = vec4(tex.rgb, tex.a * (0.22 + 0.32 * vTwinkle) * uOpacity);
  }
`

// Reveal plane — the crisp photo, shown only inside a soft circular lens
// around the pointer (hover) or fully (click). During hover a luminance gate
// keeps shadow tones hidden; the click reveal relaxes that gate. Lens
// distance is in world pixels (vWorldPos), not UV, so it stays circular on a
// non-square panel.
export const planeVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec2 vWorldPos;
  void main() {
    vUv = uv;
    vWorldPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const planeFragmentShader = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  varying vec2 vWorldPos;
  uniform sampler2D uMap;
  uniform vec2 uCursorWorld;
  uniform float uRadiusPx;
  uniform float uHoverAmt;
  uniform float uClickAmt;
  uniform float uGateLo;
  uniform float uGateHi;
  uniform float uOpacity;

  void main() {
    vec2 centered = vUv - 0.5;
    float ovalMask = 1.0 - smoothstep(0.66, 1.0, dot(centered, centered) * 4.0);

    float d = distance(vWorldPos, uCursorWorld);
    float lens = 1.0 - smoothstep(uRadiusPx * 0.45, uRadiusPx, d);

    vec4 tex = texture2D(uMap, vUv);
    float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    float gate = mix(smoothstep(uGateLo, uGateHi, lum), 1.0, uClickAmt);

    float reveal = max(lens * uHoverAmt, uClickAmt);
    float alpha = reveal * ovalMask * gate * uOpacity;

    gl_FragColor = vec4(tex.rgb, alpha);
  }
`
