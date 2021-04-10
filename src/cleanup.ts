import * as core from '@actions/core'
import {simctl} from './xcrun'

async function cleanup(): Promise<void> {
  try {
    const udid = core.getState('udid')
    if (udid) {
      await simctl('shutdown', udid)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

cleanup()
