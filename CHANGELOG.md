## unreleased

- Add a `wait_for_boot` option (default false, preserving current behavior) to
  wait for Simulator to finish booting the requested image before continuing.

## v3

- Breaking: change the default simulator from "model = iPhone 8" to "os = iOS",
  to avoid re-releasing the action each time the current model gets outdated.
- Bump NodeJS to 20.

## v2

- Update a few packages for security reasons.
- Bump NodeJS to 16 (#249).

## v1

- Initial release.
