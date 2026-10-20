# Versioning

Chemica is in beta. Keep the package version and user-facing version label in sync; the application reads the label from `package.json`.

- `0.x.0-beta`: a substantial feature set or coordinated improvement.
- `0.x.y-beta`: a bug fix or small improvement.
- `1.0.0`: first stable public release.

The current release is `0.7.2-beta`. `package.json` is the source of truth for application, footer, menu, feedback and backup version labels. Historical release headings in CHANGELOG and the release-notes page intentionally keep their original versions.

The tutorial version remains `0.7.0`: patch fixes must not replay the guide for completed or dismissed users. Add a user-facing CHANGELOG entry for each release. Do not create or push Git tags during automated release checks; tag creation and publication are manual release actions.
