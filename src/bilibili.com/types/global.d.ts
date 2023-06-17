declare global {
  interface HTMLElement {
    __vue__?: { _props?: Record<string, unknown> };
  }
}
export {};
