import type { LookupFunction } from 'net'

export function isBlockedIp(ip: string): boolean
export function validateMonitorUrl(rawUrl: unknown): string
export const safeLookup: LookupFunction
