# Versioning

Chemica is in beta. Keep the package version and user-facing version label in sync; the application reads the label from `package.json`.

- `0.x.0-beta`: a substantial feature set or coordinated improvement.
- `0.x.y-beta`: a bug fix or small improvement.
- `1.0.0`: first stable public release.

The current baseline is `0.6.0-beta`. A formal domain cutover may be a `0.7.0-beta` milestone. Add a user-facing `CHANGELOG.md` entry for each release. Create local Git tags only after reviewing the release; publishing tags is a separate explicit action.
