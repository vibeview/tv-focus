/**
 * Norigin Spatial Navigation 3.x (`@noriginmedia/norigin-spatial-navigation`):
 * every focus and blur norigin makes also moves the VibeView marker.
 *
 *   import { SpatialNavigation } from '@noriginmedia/norigin-spatial-navigation';
 *   import { trackNoriginFocus } from '@vibeview/tv-focus/norigin';
 *
 *   SpatialNavigation.init({ ...yourOptions });
 *   trackNoriginFocus(SpatialNavigation);   // after every init()
 *
 * It wraps the layout adapter norigin is already using, so your options stay
 * as they are (a custom `layoutAdapter` passed to init() would turn off
 * norigin's `batchInitialMeasurements`). Norigin's own focus handling runs
 * first, unchanged. Norigin is not a dependency of this package.
 */
import { clearFocused, setFocused } from './index';

interface FocusableComponent {
  node?: unknown;
}

interface FocusAdapter {
  focusNode(component: FocusableComponent): void;
  blurNode(component: FocusableComponent): void;
}

/** Marks the adapter we wrapped, so a second call does not wrap it twice. */
const WRAPPED = '__vibeviewFocus';

const isElement = (node: unknown): node is Element =>
  typeof Element !== 'undefined' && node instanceof Element;

function isAdapter(value: unknown): value is FocusAdapter & { [WRAPPED]?: true } {
  const a = value as Partial<FocusAdapter> | null;
  return !!a && typeof a.focusNode === 'function' && typeof a.blurNode === 'function';
}

/**
 * Starts marking norigin's focus. `service` is the `SpatialNavigation`
 * singleton (or your own `SpatialNavigationService`), after `init()`.
 */
export function trackNoriginFocus(service: object): void {
  // Norigin 3 keeps the adapter it focuses DOM nodes with in `layoutAdapter` (set by init()).
  const adapter = (service as { layoutAdapter?: unknown }).layoutAdapter;
  if (!isAdapter(adapter)) {
    // Never throw: this runs at app start, and a testing aid must not take the app down
    // (a norigin upgrade, or a test's norigin mock). Focus is then just not marked.
    if (typeof console !== 'undefined') {
      console.warn(
        '@vibeview/tv-focus: no norigin layout adapter found, so focus is not marked. Call trackNoriginFocus after SpatialNavigation.init(), with norigin-spatial-navigation 3.x.',
      );
    }
    return;
  }
  if (adapter[WRAPPED]) return;
  const focusNode = adapter.focusNode.bind(adapter);
  const blurNode = adapter.blurNode.bind(adapter);
  adapter.focusNode = (component) => {
    focusNode(component);
    if (isElement(component.node)) setFocused(component.node);
  };
  adapter.blurNode = (component) => {
    blurNode(component);
    if (isElement(component.node)) clearFocused(component.node);
  };
  adapter[WRAPPED] = true;
}
