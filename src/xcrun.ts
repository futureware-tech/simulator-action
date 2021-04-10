import * as core from '@actions/core'
import {exec} from 'child_process'
import {promisify} from 'util'

const execAsync = promisify(exec)
const runtimePrefix = 'com.apple.CoreSimulator.SimRuntime.'

export type DeviceInfo = {
  udid: string
  model: string
  os: string
  os_version: string
  state: string
}

export async function getDevices(): Promise<DeviceInfo[]> {
  const {stdout, stderr} = await execAsync(
    'xcrun simctl list --json devices available'
  )
  if (stderr) {
    core.warning('Errors or warnings detected in xcrun simctl output.')
    core.startGroup('xcrun (stderr)')
    core.warning(stderr)
    core.endGroup()
  }
  core.debug(`xcrun list of available devices:\n${stdout}`)

  const runtimes = JSON.parse(stdout).devices as {
    [runtime: string]: {
      udid: string
      name: string
      state: string
    }[]
  }
  core.debug(`${Object.keys(runtimes).length} runtimes found`)

  const allDevices: DeviceInfo[] = []

  for (const [runtime, devices] of Object.entries(runtimes)) {
    if (runtime.startsWith(runtimePrefix)) {
      const osAndVersion = runtime.substr(runtimePrefix.length).split('-')
      const os = osAndVersion.shift() || ''
      const os_version = osAndVersion.join('.')
      for (const device of devices) {
        allDevices.push({
          ...device,
          model: device.name,
          os,
          os_version
        })
      }
    }
  }

  return allDevices
}

export async function simctl(action: string, udid: string): Promise<void> {
  const {stdout, stderr} = await execAsync(`xcrun simctl ${action} ${udid}`)
  if (stderr) {
    core.warning(`Errors or warnings detected in xcrun ${action} output`)
    core.startGroup(`xcrun ${action} ${udid} (stderr)`)
    core.warning(stderr)
    core.endGroup()
  }
  if (core.isDebug()) {
    core.startGroup(`xcrun ${action} ${udid} (stdout)`)
    core.debug(stdout)
    core.endGroup()
  }
}
