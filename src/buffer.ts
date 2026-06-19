import { BUFFER_SIZE, REGION_SIZE, Region, regionOffset } from './types'

export { BUFFER_SIZE, REGION_SIZE, Region, regionOffset }

export function createBuffer(): Float64Array {
  return new Float64Array(BUFFER_SIZE)
}

export function cloneBuffer(buf: Float64Array): Float64Array {
  return new Float64Array(buf)
}

export function readRegion(buf: Float64Array, region: Region): Float64Array {
  const offset = regionOffset(region)
  return buf.slice(offset, offset + REGION_SIZE)
}

export function writeRegion(buf: Float64Array, region: Region, data: ArrayLike<number>): void {
  const offset = regionOffset(region)
  const len = Math.min(data.length, REGION_SIZE)
  for (let i = 0; i < len; i++) {
    buf[offset + i] = data[i]
  }
}

export function writeRegionValue(buf: Float64Array, region: Region, index: number, value: number): void {
  const offset = regionOffset(region)
  if (index >= 0 && index < REGION_SIZE) {
    buf[offset + index] = value
  }
}

export function readRegionValue(buf: Float64Array, region: Region, index: number): number {
  const offset = regionOffset(region)
  return index >= 0 && index < REGION_SIZE ? buf[offset + index] : 0
}

export function getRegionRMS(buf: Float64Array, region: Region): number {
  const offset = regionOffset(region)
  let sumSq = 0
  for (let i = 0; i < REGION_SIZE; i++) {
    sumSq += buf[offset + i] ** 2
  }
  return Math.sqrt(sumSq / REGION_SIZE)
}

export function getRegionEnergy(buf: Float64Array, region: Region): number {
  const offset = regionOffset(region)
  let energy = 0
  for (let i = 0; i < REGION_SIZE; i++) {
    energy += buf[offset + i] ** 2
  }
  return energy
}

export function bufferSnapshot(buf: Float64Array): Record<string, number> {
  const snapshot: Record<string, number> = {}
  for (const r of Object.values(Region).filter(v => typeof v === 'number') as Region[]) {
    const name = Region[r] as string
    snapshot[name] = getRegionRMS(buf, r)
  }
  return snapshot
}

export function clearRegion(buf: Float64Array, region: Region): void {
  const offset = regionOffset(region)
  buf.fill(0, offset, offset + REGION_SIZE)
}
