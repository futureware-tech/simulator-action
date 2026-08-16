import * as core from '@actions/core'
import {exec} from 'child_process'
import {promisify} from 'util'

const execAsync = promisify(exec)
const PS_COMMAND = 'ps -Aww -o pid=,ppid=,pcpu=,command='

type ProcessSample = {pid: number; ppid: number; pcpu: number; command: string}

function parsePsOutput(psOutput: string): ProcessSample[] {
  const samples: ProcessSample[] = []
  for (const line of psOutput.split('\n')) {
    const match = /^\s*(\d+)\s+(\d+)\s+([\d.]+)\s+(.*)$/.exec(line)
    if (!match) continue
    samples.push({
      pid: Number(match[1]),
      ppid: Number(match[2]),
      pcpu: Number(match[3]),
      command: match[4]
    })
  }
  return samples
}

/**
 * Sums the %CPU of every direct child of the launchd_sim process belonging to `udid`. Returns
 * undefined if no matching launchd_sim process is found (e.g. not booted yet).
 */
export function computeSettleCpu(
  psOutput: string,
  udid: string
): number | undefined {
  const samples = parsePsOutput(psOutput)
  const udidLower = udid.toLowerCase()
  const launchdSim = samples.find(
    s =>
      s.command.includes('launchd_sim') &&
      s.command.toLowerCase().includes(udidLower)
  )
  if (!launchdSim) return undefined
  return samples
    .filter(s => s.ppid === launchdSim.pid)
    .reduce((sum, s) => sum + s.pcpu, 0)
}

export type WaitForSettleOptions = {
  udid: string
  cpuThresholdPercent: number
  consecutiveSamples: number
  checkIntervalMs: number
  timeoutMs: number // always a concrete bound - never "wait forever"
}

/** Polls until CPU stays under threshold for N consecutive samples, or timeoutMs elapses. Never throws. */
export async function waitForSettle(
  options: WaitForSettleOptions
): Promise<void> {
  const {
    udid,
    cpuThresholdPercent,
    consecutiveSamples,
    checkIntervalMs,
    timeoutMs
  } = options
  const startedAt = Date.now()
  let consecutiveUnderThreshold = 0

  for (;;) {
    let cpu: number | undefined
    try {
      const {stdout} = await execAsync(PS_COMMAND, {encoding: 'utf8'})
      cpu = computeSettleCpu(stdout.toString(), udid)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      core.warning(`Failed to check Simulator settle status: ${message}`)
    }

    if (cpu === undefined) {
      consecutiveUnderThreshold = 0
    } else {
      core.debug(`Simulator background CPU usage: ${cpu.toFixed(1)}%`)
      consecutiveUnderThreshold =
        cpu < cpuThresholdPercent ? consecutiveUnderThreshold + 1 : 0
      if (consecutiveUnderThreshold >= consecutiveSamples) {
        core.info(
          `Simulator has settled (CPU below ${cpuThresholdPercent}% for ${consecutiveSamples} checks).`
        )
        return
      }
    }

    if (Date.now() - startedAt >= timeoutMs) {
      core.warning(
        `Timed out after ${Math.round((Date.now() - startedAt) / 1000)}s waiting for the Simulator to ` +
          `settle below ${cpuThresholdPercent}% CPU. Continuing anyway.`
      )
      return
    }

    await new Promise(resolve => setTimeout(resolve, checkIntervalMs))
  }
}
