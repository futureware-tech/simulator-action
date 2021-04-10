import * as fs from 'fs'
import {getDevices} from './xcrun'
;(async () => {
  const outputFile = process.argv.slice(2)[0] || 'devices.md'
  process.stdout.write(
    `Saving the list of devices in Markdown format to ${outputFile}\n`
  )
  const header =
    '"model" | "os" | "os_version" | "udid"\n--- | --- | --- | ---\n'
  fs.writeFileSync(
    outputFile,
    header +
      (await getDevices())
        .map(
          device =>
            `\`${device.model}\` | \`${device.os}\` | ` +
            `\`${device.os_version}\` | \`${device.udid}\``
        )
        .join('\n')
  )
})()
