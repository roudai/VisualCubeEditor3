// Minimal HTMLElement stub for sr-visualizer interop.
// DOM lib is excluded (FR-004: no DOM/Canvas dependency).
// svgdom elements satisfy this interface at runtime.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface HTMLElement {}

declare module 'svgdom' {
  interface SvgDomElement {
    innerHTML: string
    outerHTML: string
    querySelector(selector: string): SvgDomElement | null
  }

  interface SvgDomDocument {
    createElement(tagName: string): SvgDomElement
    createElementNS(namespace: string, tagName: string): SvgDomElement
    getElementsByTagName(tagName: string): ArrayLike<SvgDomElement>
    readonly documentElement: SvgDomElement
  }

  interface SvgDomWindow {
    readonly document: SvgDomDocument
  }

  export function createSVGWindow(): SvgDomWindow
}
