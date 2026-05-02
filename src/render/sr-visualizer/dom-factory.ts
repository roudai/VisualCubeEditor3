import { createSVGWindow } from 'svgdom'

// Create a single shared svgdom window for the lifetime of this module.
// This module MUST be imported before sr-visualizer so that svg.js v2
// (a dependency of sr-visualizer) finds globalThis.window when it first loads.
// In ES module evaluation order, sibling imports are evaluated left-to-right,
// so placing this import before sr-visualizer in adapter.ts guarantees ordering.
const svgWindow = createSVGWindow()

;(globalThis as Record<string, unknown>).window = svgWindow
;(globalThis as Record<string, unknown>).document = svgWindow.document

export type DomContainer = ReturnType<typeof svgWindow.document.createElement>

export function createDOMContainer(): DomContainer {
  return svgWindow.document.createElement('div')
}
