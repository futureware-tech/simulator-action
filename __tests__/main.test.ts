import * as cp from 'child_process'
import * as path from 'path'
import * as process from 'process'

// The available iOS device lineup shifts as the CI runner's Xcode version
// changes, so a hardcoded model (e.g. a fixed "iPhone 16") can disappear.
// Look up a model that's actually installed instead.
function findAnyAvailableIOSModel(): string {
  const devices = JSON.parse(
    cp
      .execFileSync('xcrun', [
        'simctl',
        'list',
        'devices',
        'available',
        '--json'
      ])
      .toString()
  ).devices as {[runtime: string]: {name: string}[]}

  for (const [runtime, runtimeDevices] of Object.entries(devices)) {
    if (runtime.includes('SimRuntime.iOS') && runtimeDevices.length > 0) {
      return runtimeDevices[0].name
    }
  }

  throw new Error(
    'No available iOS Simulator devices found to run the test against'
  )
}

test('boots a device', () => {
  process.env['INPUT_OS_VERSION'] = '>=10.0'
  const nodeProcess = process.execPath
  const actionMain = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }

  const firstRunOutput = cp
    .execFileSync(nodeProcess, [actionMain], options)
    .toString()
  expect(firstRunOutput).toContain('Booting device')
  expect(firstRunOutput).not.toContain('Waiting for the Simulator to settle')

  // lower-cased on purpose: also exercises the case-insensitive model match
  process.env['INPUT_MODEL'] = findAnyAvailableIOSModel().toLowerCase()
  expect(
    cp.execFileSync(nodeProcess, [actionMain], options).toString()
  ).toContain('Booting device')

  process.env['INPUT_WAIT_FOR_BOOT'] = 'true'
  expect(
    cp.execFileSync(nodeProcess, [actionMain], options).toString()
  ).toContain('Waiting for device to finish booting')

  process.env['INPUT_SETTLE_TIMEOUT_SECONDS'] = '5'
  process.env['INPUT_SETTLE_CHECK_INTERVAL_SECONDS'] = '1'
  expect(
    cp.execFileSync(nodeProcess, [actionMain], options).toString()
  ).toContain('Waiting for the Simulator to settle')
  delete process.env['INPUT_SETTLE_TIMEOUT_SECONDS']
  delete process.env['INPUT_SETTLE_CHECK_INTERVAL_SECONDS']

  process.env['INPUT_MODEL'] = 'Pixel 4'
  expect(() => cp.execFileSync(nodeProcess, [actionMain], options)).toThrow()
})
