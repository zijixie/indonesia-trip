import type { TimePoint, TimeZoneCode } from '@/types/trip'
import { TIME_ZONES } from '@/types/trip'

const BEIJING_OFFSET = 8

/** 把 'YYYY-MM-DDTHH:mm'（北京时间）解析成真实时刻。 */
export function toDate(bj: string): Date {
  const [datePart, timePart = '00:00'] = bj.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh, mm] = timePart.split(':').map(Number)
  return new Date(Date.UTC(y, m - 1, d, hh - BEIJING_OFFSET, mm))
}

/** 按指定 UTC 偏移取「墙上时间」。 */
function wallClock(date: Date, offset: number) {
  const shifted = new Date(date.getTime() + offset * 3600_000)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    weekday: shifted.getUTCDay(),
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 北京时间 HH:mm（原文给出的数值） */
export function beijingTime(tp: TimePoint): string {
  const w = wallClock(toDate(tp.bj), BEIJING_OFFSET)
  return `${pad(w.hour)}:${pad(w.minute)}`
}

/** 当地时间 HH:mm（由北京时间按时区偏移换算） */
export function localTime(tp: TimePoint): string {
  const w = wallClock(toDate(tp.bj), TIME_ZONES[tp.tz].offset)
  return `${pad(w.hour)}:${pad(w.minute)}`
}

/** 当地时间与北京时间是否落在不同日历日 */
export function crossesDate(tp: TimePoint): boolean {
  const a = wallClock(toDate(tp.bj), TIME_ZONES[tp.tz].offset)
  const b = wallClock(toDate(tp.bj), BEIJING_OFFSET)
  return a.day !== b.day
}

/** 当地时间与北京时间是否相同（同为 UTC+8 时无需双显示） */
export function sameAsBeijing(tz: TimeZoneCode): boolean {
  return TIME_ZONES[tz].offset === BEIJING_OFFSET
}

export function tzDelta(tz: TimeZoneCode): string {
  const diff = TIME_ZONES[tz].offset - BEIJING_OFFSET
  if (diff === 0) return '与北京同时'
  return diff > 0 ? `比北京早 ${diff} 小时` : `比北京晚 ${Math.abs(diff)} 小时`
}

/** 两个时间点之间的分钟差（真实时刻差） */
export function diffMinutes(a: TimePoint, b: TimePoint): number {
  return Math.round((toDate(b.bj).getTime() - toDate(a.bj).getTime()) / 60000)
}

/** 分钟 → '5h40m' / '45m' */
export function formatDuration(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h${m}m`
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

/** 'YYYY-MM-DD' → 周几 */
export function weekdayOf(date: string): string {
  const w = wallClock(toDate(`${date}T12:00`), BEIJING_OFFSET)
  return WEEKDAYS[w.weekday]
}

/** 'YYYY-MM-DD' → '9月27日' */
export function prettyDate(date: string): string {
  const [, m, d] = date.split('-').map(Number)
  return `${m}月${d}日`
}

/** 'YYYY-MM-DD' → '09.27' */
export function shortDate(date: string): string {
  const [, m, d] = date.split('-').map(Number)
  return `${pad(m)}.${pad(d)}`
}

/** 列出 [from, to] 之间的所有日期（含端点） */
export function dateRange(from: string, to: string): string[] {
  const out: string[] = []
  const end = toDate(`${to}T12:00`).getTime()
  let cur = toDate(`${from}T12:00`)
  while (cur.getTime() <= end) {
    const w = wallClock(cur, BEIJING_OFFSET)
    out.push(`${w.year}-${pad(w.month)}-${pad(w.day)}`)
    cur = new Date(cur.getTime() + 86400_000)
  }
  return out
}

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalMs: number
}

export function countdownTo(target: Date, now: Date = new Date()): Countdown {
  const totalMs = Math.max(0, target.getTime() - now.getTime())
  const totalSec = Math.floor(totalMs / 1000)
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    totalMs,
  }
}

/** 某时区的当前墙上时间 HH:mm:ss */
export function nowInZone(tz: TimeZoneCode, now: Date = new Date()): string {
  const w = wallClock(now, TIME_ZONES[tz].offset)
  const sec = new Date(now.getTime() + TIME_ZONES[tz].offset * 3600_000).getUTCSeconds()
  return `${pad(w.hour)}:${pad(w.minute)}:${pad(sec)}`
}
