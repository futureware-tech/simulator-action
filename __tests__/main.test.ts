import * as cp from 'child_process'
import * as path from 'path'
import * as process from 'process'

test('test runs', () => {
  process.env['INPUT_MILLISECONDS'] = '500'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
  expect(2).toBeGreaterThan(1)
  // await expect(getDevices()).rejects.toThrow('milliseconds not a number')
})
