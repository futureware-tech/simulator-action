import {writeFile} from 'node:fs/promises'
import {getDevices} from './xcrun.js'

const outputFile = process.argv[2] ?? 'devices.md'
process.stdout.write(
  `Saving the list of devices in Markdown format to ${outputFile}\n`
)
const header = '"model" | "os" | "os_version" | "udid"\n--- | --- | --- | ---\n'
await writeFile(
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
