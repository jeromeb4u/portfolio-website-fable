/**
 * GLSL for the hero particle portrait's reveal plane — the crisp photograph
 * sitting behind the point cloud.
 *
 * The particles themselves need no custom shader: they are a plain
 * `THREE.PointsMaterial` fed this sprite, and their motion is written straight
 * into the position buffer each frame (see lib/particlePortrait.ts).
 *
 * The plane shows the photo only where two masks agree: an ellipse matching
 * the particle crop (so the rectangular frame's corners never appear) and a
 * soft circle following the cursor. A click sets `uFull`, which reveals the
 * whole portrait and relaxes the luminance gate so shadow tones come through.
 */
export const planeVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const planeFragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uMap;
  uniform vec2 uCursor;
  uniform float uActive;
  uniform float uRadius;
  uniform float uFull;
  void main() {
    vec4 tex = texture2D(uMap, vUv);
    float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    // ellipse face mask (matches the particle crop) to hide the corners
    float nx = (vUv.x - 0.5) / 0.46;
    float ny = (vUv.y - 0.5) / 0.52;
    float e = nx * nx + ny * ny;
    float face = 1.0 - smoothstep(0.72, 1.0, e);
    // soft circular reveal around the cursor
    float dist = distance(vUv, uCursor);
    float circle = 1.0 - smoothstep(uRadius * 0.45, uRadius, dist);
    // hover reveals a circle under the cursor; a click reveals the whole
    // portrait (uFull), relaxing the luminance gate so darker tones show.
    float shown = max(circle * uActive, uFull);
    float gate = mix(smoothstep(0.1, 0.3, lum), 1.0, uFull);
    float a = shown * face * gate;
    gl_FragColor = vec4(tex.rgb * 1.12, a);
  }
`
