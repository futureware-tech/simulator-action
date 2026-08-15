import {computeSettleCpu} from '../src/settle'

const UDID = 'AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE'

function psLine(
  pid: number,
  ppid: number,
  pcpu: number,
  command: string
): string {
  return `${pid} ${ppid} ${pcpu} ${command}`
}

test('sums only direct children of the target udid launchd_sim', () => {
  const psOutput = [
    psLine(1, 0, 0.0, '/sbin/launchd'),
    psLine(100, 1, 0.0, `/path/to/launchd_sim ${UDID}`),
    psLine(101, 100, 30.5, 'com.apple.analyticsd'),
    psLine(102, 100, 15.2, 'com.apple.mobileassetd')
  ].join('\n')

  expect(computeSettleCpu(psOutput, UDID)).toBeCloseTo(45.7)
})

test('returns undefined when the udid is not found', () => {
  const psOutput = [
    psLine(1, 0, 0.0, '/sbin/launchd'),
    psLine(100, 1, 0.0, `/path/to/launchd_sim SOME-OTHER-UDID`),
    psLine(101, 100, 30.5, 'com.apple.analyticsd')
  ].join('\n')

  expect(computeSettleCpu(psOutput, UDID)).toBeUndefined()
})

test('a second simulator launchd_sim tree does not leak into the sum', () => {
  const OTHER_UDID = '11111111-2222-3333-4444-555555555555'
  const psOutput = [
    psLine(1, 0, 0.0, '/sbin/launchd'),
    psLine(100, 1, 0.0, `/path/to/launchd_sim ${UDID}`),
    psLine(101, 100, 10.0, 'com.apple.analyticsd'),
    psLine(200, 1, 0.0, `/path/to/launchd_sim ${OTHER_UDID}`),
    psLine(201, 200, 90.0, 'com.apple.mobileassetd')
  ].join('\n')

  expect(computeSettleCpu(psOutput, UDID)).toBeCloseTo(10.0)
})

test('grandchildren are excluded, only direct children counted', () => {
  const psOutput = [
    psLine(1, 0, 0.0, '/sbin/launchd'),
    psLine(100, 1, 0.0, `/path/to/launchd_sim ${UDID}`),
    psLine(101, 100, 10.0, 'com.apple.analyticsd'),
    psLine(102, 101, 99.0, 'grandchild-process')
  ].join('\n')

  expect(computeSettleCpu(psOutput, UDID)).toBeCloseTo(10.0)
})

test('returns 0 (not undefined) when launchd_sim exists but has no children yet', () => {
  const psOutput = [
    psLine(1, 0, 0.0, '/sbin/launchd'),
    psLine(100, 1, 0.0, `/path/to/launchd_sim ${UDID}`)
  ].join('\n')

  expect(computeSettleCpu(psOutput, UDID)).toBe(0)
})
