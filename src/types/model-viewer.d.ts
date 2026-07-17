import type { DetailedHTMLProps, HTMLAttributes } from 'react'

// <model-viewer> is a custom element (@google/model-viewer). Declaring it here
// lets TSX use the tag directly; attributes are passed through verbatim to the
// DOM by React 19's custom-element handling, so kebab-case names are correct.
// React 19 moved the JSX namespace into the `react` module itself (instead of
// a global `JSX` namespace), so intrinsic elements must be augmented here.
type ModelViewerAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string
  alt?: string
  poster?: string
  'auto-rotate'?: boolean
  'auto-rotate-delay'?: number
  'camera-controls'?: boolean
  'touch-action'?: string
  'shadow-intensity'?: string | number
  exposure?: string | number
  loading?: 'auto' | 'lazy' | 'eager'
  reveal?: 'auto' | 'interaction' | 'manual'
  'interaction-prompt'?: string
  'disable-zoom'?: boolean
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes
    }
  }
}

export {}
