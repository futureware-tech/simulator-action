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

export function deviceToString(device: DeviceInfo): string {
  return (
    `${device.model} (${device.os} ${device.os_version}) ` +
    `[${device.udid}] - ${device.state}`
  )
}

export async function getDevices(): Promise<DeviceInfo[]> {
  const runtimes = JSON.parse(
    await xcrun('simctl list --json devices available')
  ).devices as {
    [runtime: string]: {
      udid: string
      name: string
      state: string
    }[]
  }
  core.info(`${Object.keys(runtimes).length} runtimes found`)

  const allDevices: DeviceInfo[] = []

  for (const [runtime, devices] of Object.entries(runtimes)) {
    if (runtime.startsWith(runtimePrefix)) {
      const osAndVersion = runtime.substr(runtimePrefix.length).split('-')
      const os = osAndVersion.shift() || ''
      const os_version = osAndVersion.join('.')
      for (const device of devices) {
        const info: DeviceInfo = {
          ...device,
          model: device.name,
          os,
          os_version
        }
        core.debug(deviceToString(info))
        allDevices.push(info)
      }
    }
  }

  return allDevices
}

export async function simctl(action: string, udid: string): Promise<void> {
  await xcrun(`simctl ${action} ${udid}`)
}

async function xcrun(tail: string): Promise<string> {
  const command = `xcrun ${tail}`
  core.info(`$ ${command}`)

  let res: {stdout?: string; stderr?: string} | undefined
  try {
    res = await execAsync(command)
    return res.stdout || ''
  } catch (e) {
    res = e as {stdout?: string; stderr?: string}
    throw e
  } finally {
    if (res?.stderr) {
      core.warning(`Errors or warnings in the output of ${command}`)
      core.startGroup(`[stderr] ${command}`)
      core.warning(res.stderr)
      core.endGroup()
    }
    if (res?.stdout && core.isDebug()) {
      core.startGroup(`[stdout] ${command}`)
      core.debug(res.stdout)
      core.endGroup()
    }
  }
}
