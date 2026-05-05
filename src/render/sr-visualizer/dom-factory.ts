// In a browser/happy-dom environment the global window is already available.
// In Node environment we initialize svgdom here, before sr-visualizer is imported,
// so that SVG.js v2 picks up a working DOM when it first loads.

export type DomContainer = Element

if (typeof window === 'undefined') {
  // svgdom lacks TypeScript types; cast through unknown is safe here
  const { createSVGWindow } = await import('svgdom')
  const svgWindow = createSVGWindow() as unknown as { document: Document }
  ;(globalThis as Record<string, unknown>).window = svgWindow
  ;(globalThis as Record<string, unknown>).document = svgWindow.document
}

// Kept for call-site compatibility; initialization now happens at module load time.
export async function ensureSVGWindow(): Promise<void> {}

export function createDOMContainer(): DomContainer {
  return document.createElement('div')
}
