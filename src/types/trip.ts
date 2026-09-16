/**
 * 行程数据模型。
 *
 * 数据来源唯一：/Users/xzp/Desktop/印尼.md
 * 原则：只收录该文件里写明的事实。文件里没有的（餐厅名、景点、门票、价格、
 * 酒店介绍等）一律不补充；文件里没写时间的条目用 timeText 保留原文措辞。
 */

/** 行程覆盖的时区。印尼跨三区，本行程只涉及 WIB / WITA。 */
export type TimeZoneCode = 'CST' | 'MYT' | 'WIB' | 'WITA'

export interface TimeZoneInfo {
  code: TimeZoneCode
  /** UTC 偏移小时数 */
  offset: number
  label: string
  /** 该时区在本行程中对应的地点 */
  where: string
}

export const TIME_ZONES: Record<TimeZoneCode, TimeZoneInfo> = {
  CST: { code: 'CST', offset: 8, label: '北京时间', where: '上海' },
  MYT: { code: 'MYT', offset: 8, label: '马来西亚时间', where: '吉隆坡' },
  WIB: { code: 'WIB', offset: 7, label: '西印尼时间', where: '泗水 · 布罗莫' },
  WITA: { code: 'WITA', offset: 8, label: '中印尼时间', where: '巴厘岛 · 科莫多' },
}

/** 一个时间点。md 中所有时间均为北京时间，tz 用于换算出当地时间。 */
export interface TimePoint {
  /** 北京时间，格式 'YYYY-MM-DDTHH:mm'（原文给出） */
  bj: string
  /** 该时间点所在地的时区 */
  tz: TimeZoneCode
}

export type SegmentKind = 'flight' | 'stay' | 'meal'

export interface Place {
  /** 原文中的名称 */
  name: string
  /** 原文中的地址，没有就留空 */
  address?: string
  /** 原文中给出的 Google Maps 链接；没有原文链接时用名称生成搜索链接 */
  mapsUrl: string
  /** 链接是原文自带 (true) 还是按名称生成的搜索链接 (false) */
  mapsUrlFromSource: boolean
}

export interface FlightDetail {
  /** 航班号 */
  code: string
  /** 航司（原文写法） */
  airline: string
  from: { label: string; city: string }
  to: { label: string; city: string }
}

export interface Segment {
  id: string
  kind: SegmentKind
  /** 标题，尽量沿用原文措辞 */
  title: string
  /** 有确切时间的条目 */
  start?: TimePoint
  end?: TimePoint
  /** 原文没给确切时间时，保留原文措辞，如「差不多中午」「吃完中饭后」 */
  timeText?: string
  place?: Place
  flight?: FlightDetail
  /** 原文里的补充说明，逐字保留 */
  note?: string
  /** 原文正文，逐字保留 */
  sourceText: string
  /** 原文中的条目序号（1-11） */
  sourceIndex: number
  /** 所属自然日（北京时间）'YYYY-MM-DD' */
  day: string
}

/** 按经过的地方把八天分成几段，只用来给页面配色和分节。 */
export type Chapter = 'depart' | 'java' | 'bali' | 'komodo' | 'home'

export interface ChapterInfo {
  key: Chapter
  title: string
  /** 这一段的地理位置，取自原文的航班与住宿 */
  place: string
}

/** 每段的地名只用原文出现过的写法 */
export const CHAPTERS: Record<Chapter, ChapterInfo> = {
  depart: { key: 'depart', title: '启程', place: '上海 → 吉隆坡 → 泗水' },
  java: { key: 'java', title: '火山', place: '布罗莫，东爪哇' },
  bali: { key: 'bali', title: '海岛', place: '巴厘岛，乌布与金巴兰' },
  komodo: { key: 'komodo', title: '科莫多', place: '下拉布安' },
  home: { key: 'home', title: '回程', place: '下拉布安 → 吉隆坡 → 上海' },
}

export interface TripDay {
  date: string
  /** 第几天（1 起） */
  index: number
  /** 当天所在地，由原文推得 */
  where: string
  chapter: Chapter
  tz: TimeZoneCode
  /** 当天出发（start 落在当天）的条目 */
  segments: Segment[]
  /** 跨日抵达当天的条目（end 落在当天，start 在前一天） */
  arrivals: Segment[]
  /** 原文当天没有任何条目 */
  empty: boolean
}

/** 两段行程之间的空隙（由时间推算，非原文内容） */
export interface Gap {
  minutes: number
  atPlace: string
}
