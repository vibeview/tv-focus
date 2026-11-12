import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearFocused, FOCUS_ATTRIBUTE, getFocused, setFocused, VERSION_ATTRIBUTE } from './index';

const marked = () => [...document.querySelectorAll(`[${FOCUS_ATTRIBUTE}]`)].map((e) => e.id);

describe('setFocused', () => {
  beforeEach(() => {
    setFocused(null);
    document.body.innerHTML = '<div id="a"></div><div id="b"></div><div id="c"></div>';
  });

  it('marks exactly one element and says the app marks its focus', () => {
    setFocused(document.getElementById('a'));
    expect(marked()).toEqual(['a']);
    setFocused(document.getElementById('b'));
    expect(marked()).toEqual(['b']);
    expect(document.documentElement.getAttribute(VERSION_ATTRIBUTE)).toBe('1');
    expect(getFocused()?.id).toBe('b');
  });

  it('clears stale markers it did not set (a re-rendered copy)', () => {
    document.getElementById('c')!.setAttribute(FOCUS_ATTRIBUTE, 'true');
    setFocused(document.getElementById('a'));
    expect(marked()).toEqual(['a']);
  });

  it('null and a blur of the focused element unmark it; a blur of another does nothing', () => {
    const a = document.getElementById('a')!;
    setFocused(a);
    clearFocused(document.getElementById('b')!);
    expect(marked()).toEqual(['a']);
    clearFocused(a);
    expect(marked()).toEqual([]);
    setFocused(a);
    setFocused(null);
    expect(marked()).toEqual([]);
    expect(getFocused()).toBeNull();
  });

  it('a late blur of a removed element leaves the newly focused one marked', () => {
    // norigin: A is focused and removed, B takes focus, then A's blur runs.
    const a = document.getElementById('a')!;
    const b = document.getElementById('b')!;
    setFocused(a);
    a.remove();
    setFocused(b);
    clearFocused(a);
    expect(marked()).toEqual(['b']);
    expect(getFocused()).toBe(b);
    // The removed element no longer carries a marker to bring back.
    expect(a.hasAttribute(FOCUS_ATTRIBUTE)).toBe(false);
  });

  it('re-marks the same element when something removed its attribute', () => {
    const a = document.getElementById('a')!;
    setFocused(a);
    a.removeAttribute(FOCUS_ATTRIBUTE);
    setFocused(a);
    expect(marked()).toEqual(['a']);
  });

  it('a removed element is not reported as focused', () => {
    const a = document.getElementById('a')!;
    setFocused(a);
    a.remove();
    expect(getFocused()).toBeNull();
  });
});

/**
 * Two copies of this module in one page (the CommonJS build bundles it into
 * both entry points; an app may also load the browser build or two versions):
 * the page's marker is the one state, so every copy sees and clears it.
 */
describe('two copies of the helper on one page', () => {
  it('agree on the focused element and each clears the other copy`s marker', async () => {
    vi.resetModules();
    const one = await import('./index');
    vi.resetModules();
    const two = await import('./index');
    expect(one.setFocused).not.toBe(two.setFocused);
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
    const a = document.getElementById('a')!;
    one.setFocused(a);
    expect(two.getFocused()).toBe(a);
    two.setFocused(null);
    expect(marked()).toEqual([]);
    expect(one.getFocused()).toBeNull();
    one.setFocused(a);
    two.clearFocused(a);
    expect(marked()).toEqual([]);
    two.setFocused(document.getElementById('b'));
    one.setFocused(a);
    expect(marked()).toEqual(['a']);
  });
});
