function fallback() {
  // https://stackoverflow.com/a/8809472
  const ts =
    typeof performance !== "undefined" && performance.now
      ? performance.now()
      : Date.now();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = ((ts + Math.random()) * 16) % 16 | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function randomUUID(): string {
  if (
    window.isSecureContext &&
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return fallback();
}
