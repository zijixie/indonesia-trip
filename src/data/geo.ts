/**
 * 路线图用的地理数据。
 *
 * 坐标来源（两类，都可追溯，没有一个是编的）：
 *  A. 原文 —— 印尼.md 里 Google Maps 链接 @lat,lng 参数直接带出来的：
 *     Plataran Bromo、Alaya Resort Ubud。
 *  B. OpenStreetMap / Nominatim 查询结果（2026-09-16 查询，ODbL）：
 *     浦东、吉隆坡、朱安达、伍拉·赖、科莫多五个机场，以及 AYANA、Katamaran
 *     两家酒店 —— 这两家原文的链接用的是 ftid，不带经纬度。
 *
 * 海岸线：Natural Earth 1:50m Admin 0（公有领域），已裁剪 + 简化后内置，
 * 运行时不请求任何外部资源。
 */
import basemap from './basemap.json'

export type CoordSource = 'md' | 'osm'

export interface GeoNode {
  id: string
  /** 图上标签 */
  label: string
  lng: number
  lat: number
  kind: 'airport' | 'hotel'
  source: CoordSource
  /** 与行程条目的对应关系（原文第几项） */
  region: 'cn' | 'my' | 'java' | 'bali' | 'komodo'
}

export const NODES: Record<string, GeoNode> = {
  pvg: { id: 'pvg', label: '上海 浦东', lng: 121.8041131, lat: 31.1427359, kind: 'airport', source: 'osm', region: 'cn' },
  kul: { id: 'kul', label: '吉隆坡', lng: 101.707448, lat: 2.7448046, kind: 'airport', source: 'osm', region: 'my' },
  sub: { id: 'sub', label: '泗水 朱安达', lng: 112.7854943, lat: -7.3807094, kind: 'airport', source: 'osm', region: 'java' },
  bromo: {
    id: 'bromo',
    label: 'Plataran Bromo',
    lng: 112.8920126,
    lat: -7.8950989,
    kind: 'hotel',
    source: 'md',
    region: 'java',
  },
  dps: { id: 'dps', label: '巴厘岛 登巴萨', lng: 115.1673704, lat: -8.746515, kind: 'airport', source: 'osm', region: 'bali' },
  ubud: {
    id: 'ubud',
    label: 'Alaya Resort Ubud',
    lng: 115.263528,
    lat: -8.5187697,
    kind: 'hotel',
    source: 'md',
    region: 'bali',
  },
  ayana: {
    id: 'ayana',
    label: 'AYANA Resort Bali',
    lng: 115.1365853,
    lat: -8.7881513,
    kind: 'hotel',
    source: 'osm',
    region: 'bali',
  },
  lbj: { id: 'lbj', label: '下拉布安 科莫多', lng: 119.888392, lat: -8.4804312, kind: 'airport', source: 'osm', region: 'komodo' },
  katamaran: {
    id: 'katamaran',
    label: 'Katamaran Komodo',
    lng: 119.8766395,
    lat: -8.4714063,
    kind: 'hotel',
    source: 'osm',
    region: 'komodo',
  },
}

export type LegMode = 'flight' | 'ground'

export interface Leg {
  /** 对应的行程条目 id（见 data/trip.ts） */
  segmentId: string
  from: string
  to: string
  mode: LegMode
  /** 航班号或交通方式，均来自原文 */
  via: string
  day: string
}

/** 每一条腿都对应原文的一项，没有额外补线。 */
export const LEGS: Leg[] = [
  { segmentId: 's1', from: 'pvg', to: 'kul', mode: 'flight', via: 'D7331', day: '2026-09-27' },
  { segmentId: 's2', from: 'kul', to: 'sub', mode: 'flight', via: 'QZ321', day: '2026-09-27' },
  { segmentId: 's4', from: 'sub', to: 'bromo', mode: 'ground', via: '包车', day: '2026-09-27' },
  { segmentId: 's5', from: 'sub', to: 'dps', mode: 'flight', via: 'QG698', day: '2026-09-28' },
  { segmentId: 's6', from: 'dps', to: 'ubud', mode: 'ground', via: '接机', day: '2026-09-28' },
  { segmentId: 's7', from: 'ubud', to: 'ayana', mode: 'ground', via: 'Grab', day: '2026-09-29' },
  { segmentId: 's8', from: 'dps', to: 'lbj', mode: 'flight', via: 'QZ648', day: '2026-10-01' },
  { segmentId: 's9', from: 'lbj', to: 'katamaran', mode: 'ground', via: '接机', day: '2026-10-01' },
  { segmentId: 's10', from: 'lbj', to: 'kul', mode: 'flight', via: 'AK311', day: '2026-10-03' },
  { segmentId: 's11', from: 'kul', to: 'pvg', mode: 'flight', via: '9C6516', day: '2026-10-03' },
]

export type MapView = 'full' | 'indonesia' | 'java' | 'bali' | 'komodo'

export interface ViewDef {
  key: MapView
  label: string
  /** [minLng, minLat, maxLng, maxLat] */
  box: [number, number, number, number]
  /** 用哪一套海岸线精度 */
  detail: 'region' | 'detail'
  /** 这一视野里要画的节点 */
  nodes: string[]
}

export const VIEWS: ViewDef[] = [
  {
    key: 'indonesia',
    label: '印尼全境',
    // 四周留足余量：容器比例随窗口变，slice 裁切时不能把标注裁掉
    box: [110.4, -10.7, 122.4, -5.9],
    detail: 'detail',
    nodes: ['sub', 'bromo', 'dps', 'ubud', 'ayana', 'lbj', 'katamaran'],
  },
  // 两个点是上下排的，取景框得横着放宽，否则扁条幅会从上下把它们裁掉
  { key: 'java', label: '东爪哇', box: [111.3, -8.45, 114.6, -6.95], detail: 'detail', nodes: ['sub', 'bromo'] },
  // 纵向取景要以三个点为中心：容器比这些框更扁，slice 会从上下裁
  { key: 'bali', label: '巴厘岛', box: [114.3, -9.2, 115.9, -8.1], detail: 'detail', nodes: ['dps', 'ubud', 'ayana'] },
  {
    key: 'komodo',
    label: '科莫多',
    box: [119.25, -8.9, 120.45, -8.05],
    detail: 'detail',
    nodes: ['lbj', 'katamaran'],
  },
  {
    key: 'full',
    label: '全程含上海',
    box: [98, -12, 125.5, 33.5],
    detail: 'region',
    nodes: Object.keys(NODES),
  },
]

export function viewDef(key: MapView): ViewDef {
  return VIEWS.find((v) => v.key === key)!
}

/** 海岸线环（扁平 [lng,lat,...]） */
export const COASTLINES: Record<'region' | 'detail', number[][]> = {
  region: basemap.region as number[][],
  detail: basemap.detail as number[][],
}

export const BASEMAP_SOURCE = basemap._source as string
