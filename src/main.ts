import * as core from '@actions/core'
import {satisfies} from 'semver'
import {getDevices, simctl} from './xcrun'

async function run(): Promise<void> {
  try {
    let model = core.getInput('model')
    const os = core.getInput('os')
    const os_version = core.getInput('os_version')
    const udid = core.getInput('udid')

    if (!udid) {
      model = 'iPhone 8'
    }

    const matchingDevices = (await getDevices()).filter(device => {
      if (udid && device.udid !== udid) {
        return false
      }
      if (model && device.model !== model) {
        return false
      }
      if (os && device.os !== os) {
        return false
      }
      if (os_version && !satisfies(device.os_version, os_version)) {
        return false
      }

      return true
    })

    if (!matchingDevices.length) {
      core.setFailed(
        'No devices found for the matching requirements. See ' +
          'https://github.com/futureware-tech/simulator-action/... for the list ' +
          'of available devices'
      )
      return
    }

    if (matchingDevices.length > 1) {
      core.warning(
        `More than one (${matchingDevices.length}) devices matching ` +
          `requirements (os:${os} os_version:${os_version} model:${model}) ` +
          'have been found.'
      )
    }

    const device = matchingDevices[0]
    core.info(
      `Picked a device: ${device.model} (${device.os} ${device.os_version}) ` +
        `[${device.udid}]`
    )

    if (device.state !== 'Shutdown') {
      core.warning(
        `Device currently in state: ${device.state}, shutting down first`
      )
      await simctl('shutdown', device.udid)
    }

    if (core.getInput('erase_before_boot') !== 'false') {
      await simctl('erase', device.udid)
    }

    if (core.getInput('shutdown_after_job') !== 'false') {
      core.saveState('udid', device.udid)
    }
    await simctl('boot', device.udid)

    core.setOutput('udid', device.udid)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
