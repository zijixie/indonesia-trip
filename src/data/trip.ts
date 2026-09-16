/**
 * 行程数据 —— 逐条对应 /Users/xzp/Desktop/印尼.md 的第 1~11 项。
 *
 * 严格规则：
 *  - 所有时间、航班号、航司、机场、酒店名、地址、Google Maps 链接均来自原文。
 *  - 原文没有确切时间的条目（第 3、4 项）用 timeText 保留原文措辞，不编造时间。
 *  - 原文没写的内容（餐厅、景点、门票、行李、天气等）一律不出现在数据里。
 *  - 唯一的派生信息：当地时间换算、时长、中转/空档时长，界面上均标注「推算」。
 */
import type { Place, Segment, TripDay } from '@/types/trip'
import { dateRange, toDate } from '@/utils/time'

/** 原文没给链接时，按地点名生成 Google Maps 搜索链接。 */
function searchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/** 机场：原文只给了名称/航站楼，链接为按名称生成的搜索链接。 */
const AIRPORTS = {
  PVG_T2: { label: '浦东T2', city: '上海', query: 'Shanghai Pudong International Airport Terminal 2' },
  KUL_T2: { label: '吉隆坡T2', city: '吉隆坡', query: 'Kuala Lumpur International Airport Terminal 2 klia2' },
  SUB_T2: { label: '朱安达T2', city: '泗水', query: 'Juanda International Airport Terminal 2 Surabaya' },
  SUB_T1: { label: '朱安达T1', city: '泗水', query: 'Juanda International Airport Terminal 1 Surabaya' },
  DPS_D: { label: '登巴萨国际 D', city: '巴厘岛', query: 'I Gusti Ngurah Rai International Airport Denpasar Bali' },
  LBJ: { label: '科莫多', city: '下拉布安', query: 'Komodo Airport Labuan Bajo' },
} as const

export function airportPlace(a: { label: string; query: string }): Place {
  return { name: a.label, mapsUrl: searchUrl(a.query), mapsUrlFromSource: false }
}

/** 四家酒店 —— 名称、地址、链接均逐字取自原文。 */
export const HOTELS: Record<string, Place> = {
  plataranBromo: {
    name: 'Plataran Bromo',
    address: 'Wonopolo, Ngadiwono, Tosari, Pasuruan Regency, East Java 67177 印度尼西亚',
    mapsUrl:
      'https://www.google.com/maps/place/Plataran+Bromo/@-7.8950989,112.8920126,17z/data=!3m1!4b1!4m9!3m8!1s0x2dd633ef8dfee069:0xa042bdc2bd9db3d9!5m2!4m1!1i2!8m2!3d-7.8950989!4d112.8920126!16s%2Fg%2F11fy_10976!5m1!1e4!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDkxMy4wIKXMDSoASAFQAw%3D%3D',
    mapsUrlFromSource: true,
  },
  alayaUbud: {
    name: 'Alaya Resort Ubud',
    address: 'Jl. Hanoman, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571 印度尼西亚',
    mapsUrl:
      'https://www.google.com/maps/place/%E9%98%BF%E8%B5%96%E8%80%B6%E4%B9%8C%E5%B8%83%E5%BA%A6%E5%81%87%E9%85%92%E5%BA%97/@-8.5187697,115.263528,17z/data=!3m1!4b1!4m9!3m8!1s0x2dd23d6c35a395c7:0x3153cf85768a9667!5m2!4m1!1i2!8m2!3d-8.5187697!4d115.263528!16s%2Fg%2F11zbqqbjs!5m1!1e4!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDkxMy4wIKXMDSoASAFQAw%3D%3D',
    mapsUrlFromSource: true,
  },
  ayanaBali: {
    name: 'AYANA Resort Bali',
    address: 'Jl. Karang Mas Sejahtera, Jimbaran, Kec. Kuta Sel., Kabupaten Badung, Bali 80364 印度尼西亚',
    mapsUrl:
      'https://www.google.com/maps?q=AYANA+Resort+Bali,+Jl.+Karang+Mas+Sejahtera,+Jimbaran,+Kec.+Kuta+Sel.,+Kabupaten+Badung,+Bali+80364%E5%8D%B0%E5%BA%A6%E5%B0%BC%E8%A5%BF%E4%BA%9A&ftid=0x2dd2448af6f410a5:0x313ee67691a146ca&entry=gps&shh=CAE&lucs=,94297699,94231188,94280568,47071704,94218641,94282134,94286869,100820247,100822504&g_ep=CAISEjI2LjMzLjEuOTYxODkxNDMyMBgAIIgnKlMsOTQyOTc2OTksOTQyMzExODgsOTQyODA1NjgsNDcwNzE3MDQsOTQyMTg2NDEsOTQyODIxMzQsOTQyODY4NjksMTAwODIwMjQ3LDEwMDgyMjUwNEICQ04%3D&skid=6ee8fd40-e850-4a62-892a-16b97176b6bd&g_st=ia',
    mapsUrlFromSource: true,
  },
  katamaranKomodo: {
    name: 'Katamaran Hotel & Resort Komodo',
    address: 'Pantai Waecicu, Labuan Bajo, Kec. Komodo, Kabupaten Manggarai Barat, Nusa Tenggara Tim. 86763 印度尼西亚',
    mapsUrl:
      'https://www.google.com/maps?q=Katamaran+Hotel+%26+Resort+Komodo,+Pantai+Waecicu,+Labuan+Bajo,+Kec.+Komodo,+Kabupaten+Manggarai+Barat,+Nusa+Tenggara+Tim.+86763%E5%8D%B0%E5%BA%A6%E5%B0%BC%E8%A5%BF%E4%BA%9A&ftid=0x2db467364d9001a7:0x206e08fba39e797b&entry=gps&shh=CAE&lucs=,94297699,94231188,94280568,47071704,94218641,94282134,94286869,100820247,100822504&g_ep=CAISEjI2LjMzLjEuOTYxODkxNDMyMBgAIIgnKlMsOTQyOTc2OTksOTQyMzExODgsOTQyODA1NjgsNDcwNzE3MDQsOTQyMTg2NDEsOTQyODIxMzQsOTQyODY4NjksMTAwODIwMjQ3LDEwMDgyMjUwNEICQ04%3D&skid=b3e1d457-b4a3-44ef-8179-e188ebf84b61&g_st=ia',
    mapsUrlFromSource: true,
  },
}

export const SEGMENTS: Segment[] = [
  {
    id: 's1',
    sourceIndex: 1,
    kind: 'flight',
    day: '2026-09-27',
    title: 'D7331 上海 → 吉隆坡',
    start: { bj: '2026-09-27T01:35', tz: 'CST' },
    end: { bj: '2026-09-27T07:15', tz: 'MYT' },
    flight: {
      code: 'D7331',
      airline: '马来西亚亚航长途',
      from: { label: AIRPORTS.PVG_T2.label, city: AIRPORTS.PVG_T2.city },
      to: { label: AIRPORTS.KUL_T2.label, city: AIRPORTS.KUL_T2.city },
    },
    sourceText: '2026.09.27 01:35(浦东T2) - 2026.09.27 07:15(吉隆坡T2)　D7331 马来西亚亚航长途 上海-吉隆坡',
  },
  {
    id: 's2',
    sourceIndex: 2,
    kind: 'flight',
    day: '2026-09-27',
    title: 'QZ321 吉隆坡 → 泗水',
    start: { bj: '2026-09-27T09:10', tz: 'MYT' },
    end: { bj: '2026-09-27T10:45', tz: 'WIB' },
    flight: {
      code: 'QZ321',
      airline: '印尼亚航',
      from: { label: AIRPORTS.KUL_T2.label, city: AIRPORTS.KUL_T2.city },
      to: { label: AIRPORTS.SUB_T2.label, city: AIRPORTS.SUB_T2.city },
    },
    sourceText: '2026.09.27 09:10(吉隆坡T2) - 2026.09.27 10:45(朱安达T2)　QZ321 印尼亚航 吉隆坡-泗水',
  },
  {
    id: 's3',
    sourceIndex: 3,
    kind: 'meal',
    day: '2026-09-27',
    title: '泗水机场周边午餐',
    timeText: '出海关差不多中午',
    note: '打算在周边找个白人多的餐厅吃饭',
    sourceText: '2026.09.27 出泗水海关差不多中午，打算在周边找个白人多的餐厅吃饭',
  },
  {
    id: 's4',
    sourceIndex: 4,
    kind: 'stay',
    day: '2026-09-27',
    title: '包车前往 Plataran Bromo 办理入住',
    timeText: '吃完中饭后',
    place: HOTELS.plataranBromo,
    sourceText:
      '2026.09.27 吃完中饭后，包车前往 Plataran Bromo（Wonopolo, Ngadiwono, Tosari, Pasuruan Regency, East Java 67177 印度尼西亚）办理入住',
  },
  {
    id: 's5',
    sourceIndex: 5,
    kind: 'flight',
    day: '2026-09-28',
    title: 'QG698 泗水 → 巴厘岛',
    start: { bj: '2026-09-28T16:50', tz: 'WIB' },
    end: { bj: '2026-09-28T18:55', tz: 'WITA' },
    flight: {
      code: 'QG698',
      airline: '连城航空',
      from: { label: AIRPORTS.SUB_T1.label, city: AIRPORTS.SUB_T1.city },
      to: { label: AIRPORTS.DPS_D.label, city: AIRPORTS.DPS_D.city },
    },
    sourceText: '2026.09.28 16:50(朱安达T1) - 2026.09.28 18:55(登巴萨国际 D)　QG698 连城航空 泗水-巴厘岛',
  },
  {
    id: 's6',
    sourceIndex: 6,
    kind: 'stay',
    day: '2026-09-28',
    title: '巴厘岛接机，前往 Alaya Resort Ubud 办理入住',
    start: { bj: '2026-09-28T19:25', tz: 'WITA' },
    place: HOTELS.alayaUbud,
    sourceText:
      '2026.09.28 19:25 巴厘岛接机，前往 Alaya Resort Ubud（Jl. Hanoman, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571 印度尼西亚）办理入住',
  },
  {
    id: 's7',
    sourceIndex: 7,
    kind: 'stay',
    day: '2026-09-29',
    title: '打 Grab 前往 AYANA Resort Bali 办理入住',
    start: { bj: '2026-09-29T18:00', tz: 'WITA' },
    place: HOTELS.ayanaBali,
    sourceText:
      '2026.09.29 18:00 打Grab前往 AYANA Resort Bali（Jl. Karang Mas Sejahtera, Jimbaran, Kec. Kuta Sel., Kabupaten Badung, Bali 80364 印度尼西亚）办理入住',
  },
  {
    id: 's8',
    sourceIndex: 8,
    kind: 'flight',
    day: '2026-10-01',
    title: 'QZ648 巴厘岛 → 下拉布安',
    start: { bj: '2026-10-01T15:45', tz: 'WITA' },
    end: { bj: '2026-10-01T16:55', tz: 'WITA' },
    flight: {
      code: 'QZ648',
      airline: '印尼亚航',
      from: { label: AIRPORTS.DPS_D.label, city: AIRPORTS.DPS_D.city },
      to: { label: AIRPORTS.LBJ.label, city: AIRPORTS.LBJ.city },
    },
    sourceText: '2026.10.1 15:45(登巴萨国际 D) - 2026.10.1 16:55(科莫多)　QZ648 印尼亚航 巴厘岛-下拉布安',
  },
  {
    id: 's9',
    sourceIndex: 9,
    kind: 'stay',
    day: '2026-10-01',
    title: '科摩多下拉布安接机，前往 Katamaran Hotel & Resort Komodo 办理入住',
    start: { bj: '2026-10-01T17:15', tz: 'WITA' },
    place: HOTELS.katamaranKomodo,
    sourceText:
      '2026.10.1 17:15 科摩多下拉布安接机，前往 Katamaran Hotel & Resort Komodo（Pantai Waecicu, Labuan Bajo, Kec. Komodo, Kabupaten Manggarai Barat, Nusa Tenggara Tim. 86763 印度尼西亚）办理入住',
  },
  {
    id: 's10',
    sourceIndex: 10,
    kind: 'flight',
    day: '2026-10-03',
    title: 'AK311 下拉布安 → 吉隆坡',
    start: { bj: '2026-10-03T15:00', tz: 'WITA' },
    end: { bj: '2026-10-03T18:40', tz: 'MYT' },
    flight: {
      code: 'AK311',
      airline: '亚洲航空',
      from: { label: AIRPORTS.LBJ.label, city: AIRPORTS.LBJ.city },
      to: { label: AIRPORTS.KUL_T2.label, city: AIRPORTS.KUL_T2.city },
    },
    sourceText: '2026.10.3 15:00(科莫多) - 2026.10.3 18:40(吉隆坡T2)　AK311 亚洲航空 下拉布安-吉隆坡',
  },
  {
    id: 's11',
    sourceIndex: 11,
    kind: 'flight',
    day: '2026-10-03',
    title: '9C6516 吉隆坡 → 上海',
    start: { bj: '2026-10-03T23:35', tz: 'MYT' },
    end: { bj: '2026-10-04T05:05', tz: 'CST' },
    flight: {
      code: '9C6516',
      airline: '春秋航空',
      from: { label: AIRPORTS.KUL_T2.label, city: AIRPORTS.KUL_T2.city },
      to: { label: AIRPORTS.PVG_T2.label, city: AIRPORTS.PVG_T2.city },
    },
    sourceText: '2026.10.3 23:35(吉隆坡T2) - 2026.10.4 05:05(浦东T2)　9C6516 春秋航空 吉隆坡-上海',
  },
]

export const TRIP_START = '2026-09-27'
export const TRIP_END = '2026-10-04'

/** 行程起点：第 1 段航班起飞的真实时刻，用于倒计时。 */
export const DEPARTURE_AT = toDate('2026-09-27T01:35')

/**
 * 每天所在地 / 时区。
 * 依据：原文第 4 项入住布罗莫（东爪哇 → WIB），第 6/7 项入住巴厘岛（WITA），
 * 第 9 项入住下拉布安（WITA）。中间没有条目的日子沿用前一晚的住宿地。
 */
const DAY_LOCATION: Record<string, { where: string; tz: TripDay['tz']; chapter: TripDay['chapter'] }> = {
  '2026-09-27': { where: '上海 → 吉隆坡 → 泗水 → 布罗莫', tz: 'WIB', chapter: 'depart' },
  '2026-09-28': { where: '布罗莫 → 泗水 → 巴厘岛 乌布', tz: 'WITA', chapter: 'java' },
  '2026-09-29': { where: '巴厘岛 乌布 → 金巴兰', tz: 'WITA', chapter: 'bali' },
  '2026-09-30': { where: '巴厘岛 金巴兰，住 AYANA', tz: 'WITA', chapter: 'bali' },
  '2026-10-01': { where: '巴厘岛 → 下拉布安', tz: 'WITA', chapter: 'komodo' },
  '2026-10-02': { where: '下拉布安，住 Katamaran', tz: 'WITA', chapter: 'komodo' },
  '2026-10-03': { where: '下拉布安 → 吉隆坡 → 飞上海', tz: 'MYT', chapter: 'home' },
  '2026-10-04': { where: '抵达上海', tz: 'CST', chapter: 'home' },
}

export const DAYS: TripDay[] = dateRange(TRIP_START, TRIP_END).map((date, i) => {
  const segments = SEGMENTS.filter((s) => s.day === date)
  const arrivals = SEGMENTS.filter((s) => s.day !== date && s.end?.bj.startsWith(date))
  const loc = DAY_LOCATION[date]
  return {
    date,
    index: i + 1,
    where: loc.where,
    chapter: loc.chapter,
    tz: loc.tz,
    segments,
    arrivals,
    empty: segments.length === 0 && arrivals.length === 0,
  }
})

export function findDay(date: string): TripDay | undefined {
  return DAYS.find((d) => d.date === date)
}

export function findSegment(id: string): Segment | undefined {
  return SEGMENTS.find((s) => s.id === id)
}

/** 原文里出现过的、带地址的地点（四家酒店）+ 机场。 */
export const AIRPORT_PLACES: Place[] = [
  airportPlace(AIRPORTS.PVG_T2),
  airportPlace(AIRPORTS.KUL_T2),
  airportPlace(AIRPORTS.SUB_T2),
  airportPlace(AIRPORTS.SUB_T1),
  airportPlace(AIRPORTS.DPS_D),
  airportPlace(AIRPORTS.LBJ),
]
