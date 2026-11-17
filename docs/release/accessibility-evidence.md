# Accessibility and device evidence

The app targets WCAG 2.2 AA on the web and in the iOS and Android apps, and the Figma page 13 mobile contract (safe
areas, 44 px touch targets, keyboard, back button, Dynamic Type). This document lists what the automated suites prove
on every build and what a person has to check by hand before each store release.

## 1. Automated on every pull request

`npm run e2e` runs on desktop Chromium, Pixel 7 Chromium, desktop Firefox and desktop WebKit. The pages are served by
the development build with the mock adapter (`?mock=sample` or `?mock=new`).

| Check                                                                   | WCAG                         | Where                                         | Scope                                                                    |
| ----------------------------------------------------------------------- | ---------------------------- | --------------------------------------------- | ------------------------------------------------------------------------ |
| axe rules for WCAG 2.0–2.2 A and AA, including colour contrast          | many                         | page suites (`e2e/*.spec.ts`, `support/a11y`) | every route and state, light and dark, at 390, 768 and 1440 px           |
| No horizontal overflow                                                  | 1.4.10                       | page suites                                   | same as axe                                                              |
| Reflow at 320 px without clipped text                                   | 1.4.10                       | `e2e/accessibility.spec.ts`                   | every route                                                              |
| Text spacing (line height 1.5, letter 0.12 em, word 0.16 em, paragraph) | 1.4.12                       | `e2e/accessibility.spec.ts`                   | every route                                                              |
| Visible, unobscured focus indicator on every tab stop                   | 2.4.7, 2.4.11                | `e2e/accessibility.spec.ts`                   | every route, first 40 tab stops                                          |
| Focus stays visible in forced colours                                   | 1.4.11                       | `e2e/accessibility.spec.ts`                   | every route, desktop Chromium                                            |
| No running animation with `prefers-reduced-motion: reduce`              | 2.3.3                        | `e2e/accessibility.spec.ts`                   | every route                                                              |
| Touch targets of at least 44 × 44 px                                    | 2.5.8 (Figma asks for 44 px) | `e2e/accessibility.spec.ts`                   | every route, Pixel 7                                                     |
| Keyboard flows, focus after navigation and state changes                | 2.1.1, 2.4.3, 3.2.x          | page suites                                   | Figma flows A–H, forms, dialogs, the skip link                           |
| Pixel-level look of the key pages                                       | —                            | `npm run e2e:visual` (CI job `visual`)        | 12 pages, 390 and 1440 px, light and dark                                |
| Native shell (safe areas, status bar, splash, keyboard, back button)    | —                            | unit tests in `src/app/core/native/`          | Capacitor plugins mocked                                                 |
| Native builds                                                           | —                            | `.github/workflows/mobile-validation.yml`     | Android debug build, lint and unit tests; iOS simulator build (unsigned) |

The routes in `e2e/accessibility.spec.ts`: Welcome, setup, My Atlas, Destinations, a Destination, a Waypoint, a
Step, the Waypoints and Steps lists, Journey, Connections, Awards, Life Dimensions and one dimension, Settings,
Companion settings, More and Not found.

## 2. Manual checks before each store release

Automated tools find about a third of WCAG problems. Run these on the release candidate and record the result, the
device or browser, the version and the date in the release notes.

### 2.1 Screen readers

For every page, check that the reading order follows the visual order, every control has a name, role and state, the
page heading is announced after navigation, and live updates (Loading, Error, saved, celebration) are announced once.

- [ ] VoiceOver on macOS with Safari.
- [ ] VoiceOver on iOS in the app.
- [ ] TalkBack on Android in the app.
- [ ] NVDA on Windows with Firefox or Chrome.

Pay attention to the custom visualisations: the Connections graph and its List view, the Journey timeline and its
agenda, and the progress rings. Each must be usable through its text alternative.

### 2.2 Display settings

- [ ] Browser zoom at 200 % and 400 % on desktop: no lost content or function.
- [ ] Windows High Contrast (forced colours): borders, focus, selected states and icons stay visible.
- [ ] iOS Dynamic Type and Android font scale at the largest setting: text wraps, nothing is cut off.
- [ ] iOS Smart Invert and Android colour inversion: images and the Atlas symbol stay recognisable.
- [ ] Reduce Motion on iOS and Remove animations on Android: no page transitions or celebration motion.

## 3. Real devices

Run the release candidate on at least one current iPhone and one mid-range Android phone (`npm run build`,
`npx cap sync`, then run from Xcode and Android Studio).

- [ ] Launch: the splash shows the symbol on tide space and hides after the first page renders.
- [ ] Safe areas: nothing sits under the notch, the Dynamic Island, the home indicator or the Android navigation bar,
      in portrait and landscape.
- [ ] Status bar: readable icons in the light and the dark theme, and after switching the theme in Settings.
- [ ] Keyboard: the focused field stays visible above the keyboard in the Destination, Waypoint, Step and note forms.
- [ ] Android back button: closes an open dialog or menu, then navigates back; with no history left it minimises the app.
- [ ] iOS: every detail page has an in-app way back (back link or navigation); the WebView has no edge-swipe back.
- [ ] Bottom navigation, More and the companion card work with one thumb.
- [ ] App icon on the home screen, in Settings and in Spotlight (iOS); with circle, squircle and rounded-square masks
      (Android).
- [ ] Scrolling and navigation are smooth on the mid-range Android phone.

## 4. Status

| Area                                | Status                                                                      |
| ----------------------------------- | --------------------------------------------------------------------------- |
| Automated checks (§1)               | Pass in all four browser projects                                           |
| iOS simulator (iPhone 16, iOS 18.2) | Launch, splash, safe areas and status bar in both themes checked            |
| Android build                       | Debug build, lint and unit tests pass; not yet run on an emulator or device |
| Screen readers (§2.1)               | Open: owner                                                                 |
| Display settings (§2.2)             | Forced colours, reduced motion and reflow automated; device settings open   |
| Real devices (§3)                   | Open: owner                                                                 |
