# Archenum Collabora source fork

Upstream source: CollaboraOnline/online.mirror, initial commit
`1ad60a7021a1814ae9f47fbe79f4372e2ebe90b9`.
The separate CollaboraOnline/online repository contains deployment recipes,
not the editor/engine source. Preserve upstream license and copyright notices.

The Archenum chrome layer is `browser/css/archenum-surface.css`, registered
in COOL_CSS so both individual and bundled builds include it. Dark chrome
uses Archenum zinc surfaces and restrained red accents. The light theme and
OS forced-colors remain supported. Document page/background colors, native
redline colors, comments, UNO commands, WOPI and saving are not rewritten.
Mobile wizard controls retain upstream behavior with 48px touch targets.
No external fonts or assets are requested by this layer.

Web boot defaults select dark chrome and non-inverted document pages. Existing
saved user choices and explicit integrator defaults retain their normal
precedence; SavedUIState is not disabled by the fork. This includes Archenum's
web-based Electron and mobile WebView integrations, not Collabora native apps.
Run `node --test browser/archenum-surface.test.mjs` for the four executable
boot/preference checks. They do not test tile rendering or the native engine.

This initial source change is not a compiled image or visual acceptance.
Next: build the browser and engine, verify desktop/mobile editing and Manage
Changes, produce a pinned image, and switch isolated Archenum staging only
after checkpoint/version/lease/round-trip checks. Production is not switched.
