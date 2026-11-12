# @vibeview/tv-focus

Lets VibeView see which element your Samsung (Tizen) or LG (webOS) TV web app has
focused. Recorded tests then replay by element ("select Movies") instead of by key
presses, so they keep working when the layout changes.

You need it when your app moves its highlight with its own focus system, such as a
spatial-navigation library. If your app uses the browser's own focus
(`element.focus()`), VibeView already sees it and you don't need this package.

## Setup

```bash
npm install @vibeview/tv-focus
```

### Norigin Spatial Navigation (3.x)

Call `trackNoriginFocus` right after `init()`:

```ts
import { SpatialNavigation } from '@noriginmedia/norigin-spatial-navigation';
import { trackNoriginFocus } from '@vibeview/tv-focus/norigin';

SpatialNavigation.init({
  /* your options, unchanged */
});
trackNoriginFocus(SpatialNavigation);
```

Your norigin options and behaviour stay as they are. If you call `init()` again later,
call `trackNoriginFocus` again after it.

### Any other focus system

Call `setFocused` whenever your focus moves:

```ts
import { setFocused } from '@vibeview/tv-focus';

setFocused(element); // the newly focused element
setFocused(null); // nothing is focused
```

In a blur handler, use `clearFocused(element)`: it unmarks the element only if it is
still the focused one.

### Without a bundler

Copy `node_modules/@vibeview/tv-focus/dist/index.global.js` into your app and load it
with a `<script>` tag. The same functions are then on `window.VibeViewFocus`:

```html
<script src="vendor/tv-focus.js"></script>
<script>
  VibeViewFocus.setFocused(document.querySelector('#movies'));
</script>
```

## Test ids

Give the elements your tests use a stable `data-testid` (React Native Web turns
`testID` into `data-testid`); an `id` works too. Unique ids make replays exact. Elements
without one are found by their text.

## Good to know

- **Safe in store builds.** It only sets two attributes on your page when focus
  moves: no network, no listeners, no timers.
- **Old TVs are fine.** The code runs on ES2015 browsers.
- **One element at a time.** Marking a new element unmarks the previous one, even
  after a re-render copied the old mark.
- Once your app has marked focus, VibeView reads only the mark. Call `setFocused` for
  every focus change, including the first one on each screen.

## API

| Export                            | What it does                                                   |
| --------------------------------- | -------------------------------------------------------------- |
| `setFocused(element \| null)`     | Marks the focused element; `null` means nothing is focused.    |
| `clearFocused(element)`           | Unmarks `element` if it is the focused one.                    |
| `getFocused()`                    | The element currently marked as focused, or `null`.            |
| `trackNoriginFocus(service)`      | From `@vibeview/tv-focus/norigin`: follows norigin's focus.    |

## License

MIT
