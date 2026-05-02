// In a browser environment, we use the global window/document.
// In a Node environment, we use svgdom to provide a mock DOM.
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

export type DomContainer = HTMLElement | any

let svgWindow: any = isBrowser ? window : null

export async function ensureSVGWindow() {
  if (!svgWindow && !isBrowser) {
    const { createSVGWindow } = await import('svgdom')
    svgWindow = createSVGWindow()
    ;(globalThis as Record<string, unknown>).window = svgWindow
    ;(globalThis as Record<string, unknown>).document = svgWindow.document
  }
}

export function createDOMContainer(): DomContainer {
  if (isBrowser) {
    return document.createElement('div')
  }
  if (!svgWindow) {
    throw new Error('SVG window not initialized. Call ensureSVGWindow() first in Node environment.')
  }
  return svgWindow.document.createElement('div')
}
