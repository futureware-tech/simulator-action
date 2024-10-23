import * as cp from 'child_process'
import * as path from 'path'
import * as process from 'process'

test('boots a device', () => {
  process.env['INPUT_OS_VERSION'] = '>=10.0'
  const nodeProcess = process.execPath
  const actionMain = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }

  expect(
    cp.execFileSync(nodeProcess, [actionMain], options).toString()
  ).toContain('Booting device')

  process.env['INPUT_WAIT_FOR_BOOT'] = 'true'
  expect(
    cp.execFileSync(nodeProcess, [actionMain], options).toString()
  ).toContain('Waiting for device to finish booting')

  process.env['INPUT_MODEL'] = 'Pixel 4'
  expect(() => cp.execFileSync(nodeProcess, [actionMain], options)).toThrow()
})
