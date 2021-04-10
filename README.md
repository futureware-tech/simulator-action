<p align="center">
  <a href="https://github.com/futureware-tech/simulator-action/actions"><img alt="simulator-action status" src="https://github.com/futureware-tech/simulator-action/workflows/build-test/badge.svg"></a>
</p>

# Launch iOS Simulator in GitHub Actions

This GitHub Action helps you start an iOS (tvOS, watchOS) Simulator inside the
workflow you are running. It runs equally well on GitHub runners as well as
self-hosted runners.

## Usage

```yaml
steps:
  - uses: actions/checkout@v2
  - uses: futureware-tech/simulator-action@v1
    with:
      model: 'iPhone 8'
  - run: flutter drive
```

## Inputs

Most inputs are dedicated to refine the selection of device you'd like to
launch. However, launching a device requires having a profile -- something which
is either preinstalled or needs an Apple ID to download. Since it's unlikely
that you'll trust your CI with an Apple ID, it's easier to select one of the
preinstalled profiles.

For GitHub Actions runners, a fresh list of devices is maintained in the
[Wiki](https://github.com/futureware-tech/simulator-action/wiki) of this
project. Note that UDID and OS version can be rather volatile and may change
when Mac OS updates, so it's recommended to stay with only specifying the model
or if you really need OS version, leave it on the loose side (e.g.
`os_version: ">=14.0"`).

| Name                 | Sample values            | Description                                                                                                                        |
| -------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `model`              | `iPhone 8`               | Model of the device you'd like to launch                                                                                           |
| `os`                 | `iOS`, `tvOS`, `watchOS` | OS type of the device                                                                                                              |
| `os_version`         | `>=14.0`                 | OS version specification in semver format                                                                                          |
| `udid`               | `ABCD-EFGH`              | Specific UDID you'd like to launch                                                                                                 |
| `erase_before_boot`  | `true`                   | Whether the data should be erased from device before boot. Starting for a clean state helps getting a stable environment for tests |
| `shutdown_after_job` | `true`                   | Whether to shutdown the launched Simulator after the workflow job has been finished                                                |

## Outputs

| Name   | Sample values | Description                 |
| ------ | ------------- | --------------------------- |
| `udid` | `ABCD-EFGH`   | UDID of the launched device |
