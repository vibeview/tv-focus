import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FOCUS_ATTRIBUTE, setFocused } from './index';
import { trackNoriginFocus } from './norigin';

type Component = { node?: unknown };

/** Like norigin 3's BaseWebAdapter: methods assigned in the constructor, `data-focused` never cleared. */
class BaseWebAdapter {
  calls: string[] = [];
  focusNode: (c: Component) => void;
  blurNode: (c: Component) => void;
  constructor() {
    this.focusNode = (c) => {
      this.calls.push('focus');
      (c.node as Element).setAttribute('data-focused', 'true');
    };
    this.blurNode = () => {
      this.calls.push('blur');
    };
  }
}

/** An adapter written with prototype methods. */
class PrototypeAdapter {
  calls: string[] = [];
  focusNode(_c: Component): void {
    this.calls.push('focus');
  }
  blurNode(_c: Component): void {
    this.calls.push('blur');
  }
}

const marked = () => [...document.querySelectorAll(`[${FOCUS_ATTRIBUTE}]`)].map((e) => e.id);

describe('trackNoriginFocus', () => {
  beforeEach(() => {
    setFocused(null);
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
  });

  for (const Adapter of [BaseWebAdapter, PrototypeAdapter]) {
    it(`moves the marker with norigin's focus and keeps the adapter's own behaviour (${Adapter.name})`, () => {
      const service = { layoutAdapter: new Adapter() };
      trackNoriginFocus(service);
      trackNoriginFocus(service); // a second call does not wrap twice
      const a = { node: document.getElementById('a') };
      const b = { node: document.getElementById('b') };
      service.layoutAdapter.focusNode(a);
      expect(marked()).toEqual(['a']);
      // norigin blurs the old node, then focuses the new one
      service.layoutAdapter.blurNode(a);
      service.layoutAdapter.focusNode(b);
      expect(marked()).toEqual(['b']);
      expect(service.layoutAdapter.calls).toEqual(['focus', 'blur', 'focus']);
    });
  }

  it('ignores components without a DOM node', () => {
    const service = { layoutAdapter: new PrototypeAdapter() };
    trackNoriginFocus(service);
    service.layoutAdapter.focusNode({ node: { notAnElement: true } });
    expect(marked()).toEqual([]);
  });

  it('warns and does nothing before init() or on an unknown norigin (never throws)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() => trackNoriginFocus({})).not.toThrow();
    expect(() => trackNoriginFocus({ layoutAdapter: {} })).not.toThrow();
    expect(warn).toHaveBeenCalledTimes(2);
    expect(String(warn.mock.calls[0][0])).toMatch(/after SpatialNavigation.init/);
    warn.mockRestore();
  });
});
