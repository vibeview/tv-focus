/**
 * The VibeView focus marker for TV web apps (Samsung Tizen, LG webOS).
 *
 * TV apps move a highlight with the remote, and most of them do it with their
 * own focus system (a spatial-navigation library), not the browser's focus.
 * VibeView cannot tell from outside which element that is, so the app tells
 * it: the focused element carries `data-vibeview-focus`, and only that one.
 * VibeView reads the attribute through the TV's web inspector to record which
 * element a key press landed on and to replay by element.
 *
 * `<html data-vibeview-focus-version="1">` says the app marks its focus, so
 * VibeView trusts the marker and nothing else (no marker = nothing focused).
 */

/** On the focused element; only one element has it at a time. */
export const FOCUS_ATTRIBUTE = 'data-vibeview-focus';
/** On `<html>` once the app marks its focus: the marker's version. */
export const VERSION_ATTRIBUTE = 'data-vibeview-focus-version';
export const MARKER_VERSION = '1';

/**
 * The page's marker is the only state: no module variable. Two copies of this
 * module on one page (the CommonJS build bundles it into both entry points,
 * or the browser build next to a bundled one) then always agree.
 */
function markedElements(): NodeListOf<Element> {
  return document.querySelectorAll(`[${FOCUS_ATTRIBUTE}]`);
}

function announce(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (root && root.getAttribute(VERSION_ATTRIBUTE) !== MARKER_VERSION) {
    root.setAttribute(VERSION_ATTRIBUTE, MARKER_VERSION);
  }
}

/**
 * Marks `element` as the focused one (and unmarks the previous one). `null`:
 * nothing is focused. Call it whenever your app's focus moves.
 */
export function setFocused(element: Element | null): void {
  if (typeof document === 'undefined') return;
  announce();
  // Clear every other marker, not only the last one: a re-rendered tree may have copied it.
  const marked = markedElements();
  for (let i = 0; i < marked.length; i++) {
    if (marked[i] !== element) marked[i].removeAttribute(FOCUS_ATTRIBUTE);
  }
  if (element && !element.hasAttribute(FOCUS_ATTRIBUTE))
    element.setAttribute(FOCUS_ATTRIBUTE, 'true');
}

/**
 * Unmarks `element` if it is the focused one (a blur that no focus followed
 * yet). A removed element's blur can arrive after another element took focus
 * (its stale marker went out of the page with it, out of setFocused's reach):
 * only its own marker goes, never the page's.
 */
export function clearFocused(element: Element): void {
  if (!element.hasAttribute(FOCUS_ATTRIBUTE)) return;
  if (!element.isConnected) {
    element.removeAttribute(FOCUS_ATTRIBUTE);
    return;
  }
  setFocused(null);
}

/** The element marked as focused, if it is in the page. */
export function getFocused(): Element | null {
  if (typeof document === 'undefined') return null;
  return document.querySelector(`[${FOCUS_ATTRIBUTE}]`);
}
