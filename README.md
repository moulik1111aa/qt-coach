# Aiio

An Android app that teaches *Quantitative Techniques for Managers* to an adult beginner,
step by step, for the UPES MBA exam. The learner reads short cards, walks through worked
examples at three levels, solves questions on paper and enters the key values; a wrong value
opens a "Let's learn how" sheet for exactly that step.

Design: `docs/superpowers/specs/2026-10-27-aiio-design.md` · Plan:
`docs/superpowers/plans/2026-10-27-aiio-milestone-1.md`

## Develop

```sh
npm run setup:local     # link globally installed typescript/playwright (or: npm install)
npm run check           # typecheck, unit tests, content checks, build, browser tests
npm run build && npm run serve   # http://localhost:4180 (?debug shows answers for testing)
npm run content -- --seeds 2000  # content checks for every generator at every level
```

- `src/core` — exact fractions, rounding and grading, progress rules, practice picking
- `src/content` — chapters, topics, builders (every number computed), generators, checks
- `src/ui` — screens, the sheet, keypad, maths renderer and boards
- `native/android` — the Aiio Capacitor plugin and resources

## Release

Every push to `main` builds a signed APK with GitHub Actions and publishes it as the latest
release (`Aiio.apk`). The release keystore is `native/android/aiio-release.jks.gpg`, encrypted
with the `AIIO_SIGNING_PASSWORD` repository secret.
