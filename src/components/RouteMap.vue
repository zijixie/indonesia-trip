<script setup lang="ts">
/**
 * 路线图。整张图是本地 SVG —— 海岸线来自内置的 Natural Earth 数据，
 * 坐标见 data/geo.ts 的来源说明。运行时不请求任何外部地图服务。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { COASTLINES, LEGS, NODES, VIEWS, viewDef, type MapView } from '@/data/geo'
import { findSegment } from '@/data/trip'

const props = withDefaults(
  defineProps<{
    view?: MapView
    /** 只高亮某一天的腿，其余压暗 */
    focusDay?: string
    /** 是否显示视野切换 */
    switchable?: boolean
    /** 图高度（CSS） */
    height?: string
    /** 窄屏下的高度；不传则容器比例跟随地图，横版地图不会被裁 */
    heightMobile?: string
    /** 展示用：不响应点击 */
    still?: boolean
  }>(),
  { view: 'indonesia', focusDay: '', switchable: true, height: '', heightMobile: '', still: false },
)

const active = ref<MapView>(props.view)
watch(
  () => props.view,
  (v) => (active.value = v),
)

const def = computed(() => viewDef(active.value))

/**
 * 窄屏容器基本是竖的，横版地图（印尼全境 2.47:1）塞进去 slice 只能看见 25%，
 * 所以窄屏一律完整装下。留白处露出的是 .map 的 CSS 海面渐变，和 SVG 里的海同一套色，
 * 不会出现接缝。
 *
 * 宽屏保持原来的规则不变：全程视野是竖的（上海到弗洛勒斯跨 44 个纬度），塞进横条幅里
 * slice 会把所有点都裁掉；其余视野是横的，铺满更好看。
 *
 * 这里按断点判断而不是按容器实际比例：桌面 1280×684 是 1.87:1、手机 390×240 是 1.63:1，
 * 两者太接近，用比例阈值分不开，会连桌面一起改掉。
 */
const NARROW = '(max-width: 720px)'
const mq = window.matchMedia(NARROW)
/* 初值就取实际匹配结果，否则手机上首帧会先用桌面规则渲染出被裁的图再跳一下 */
const narrow = ref(mq.matches)

const par = computed(() => {
  if (narrow.value) return 'xMidYMid meet'
  return def.value.key === 'full' ? 'xMidYMid meet' : 'xMidYMid slice'
})

/* ---------- 投影：Web Mercator ---------- */
const W = 1600
const mercY = (lat: number) => (Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * 180) / Math.PI

const frame = computed(() => {
  const [w, s, e, n] = def.value.box
  const yTop = mercY(n)
  const ySpan = yTop - mercY(s)
  const xSpan = e - w
  return { w, s, e, n, yTop, ySpan, xSpan, h: (W * ySpan) / xSpan }
})

function px(lng: number, lat: number): [number, number] {
  const f = frame.value
  return [((lng - f.w) / f.xSpan) * W, ((f.yTop - mercY(lat)) / f.ySpan) * f.h]
}

/* ---------- 海岸线 ---------- */
const landPaths = computed(() => {
  const f = frame.value
  const pad = (f.e - f.w) * 0.35
  return COASTLINES[def.value.detail]
    .map((ring) => {
      let d = ''
      let inside = false
      for (let i = 0; i < ring.length; i += 2) {
        const lng = ring[i]
        const lat = ring[i + 1]
        if (lng > f.w - pad && lng < f.e + pad && lat > f.s - pad && lat < f.n + pad) inside = true
        const [x, y] = px(lng, lat)
        d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1)
      }
      return inside ? d + 'Z' : ''
    })
    .filter(Boolean)
})

/* ---------- 航线 / 陆路 ---------- */
const shownLegs = computed(() =>
  LEGS.filter((l) => def.value.nodes.includes(l.from) && def.value.nodes.includes(l.to)),
)

/** 飞行段画成外弧，陆路画成直线 */
function legPath(fromId: string, toId: string, mode: string): string {
  const a = NODES[fromId]
  const b = NODES[toId]
  const [x1, y1] = px(a.lng, a.lat)
  const [x2, y2] = px(b.lng, b.lat)
  if (mode === 'ground') return `M${x1} ${y1}L${x2} ${y2}`
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const bulge = Math.min(len * 0.16, 190)
  // 垂线方向抬起，统一朝北（画面上方），看起来像航路
  const nx = -dy / len
  const ny = dx / len
  const sign = ny > 0 ? -1 : 1
  return `M${x1} ${y1}Q${(x1 + x2) / 2 + nx * bulge * sign} ${(y1 + y2) / 2 + ny * bulge * sign} ${x2} ${y2}`
}

function legDim(day: string): boolean {
  return !!props.focusDay && props.focusDay !== day
}

/* ---------- 标注位置 ---------- */
type Lab = { dx: number; dy: number; anchor: 'start' | 'middle' | 'end'; text: string }
const LABELS: Record<MapView, Record<string, Lab | null>> = {
  indonesia: {
    sub: { dx: 0, dy: -20, anchor: 'middle', text: '泗水' },
    bromo: { dx: 6, dy: 26, anchor: 'start', text: '布罗莫' },
    dps: null,
    ayana: null,
    ubud: { dx: 14, dy: -10, anchor: 'start', text: '巴厘岛' },
    lbj: { dx: 2, dy: -22, anchor: 'end', text: '下拉布安' },
    katamaran: null,
  },
  java: {
    sub: { dx: 14, dy: -6, anchor: 'start', text: '朱安达机场' },
    bromo: { dx: 14, dy: 8, anchor: 'start', text: 'Plataran Bromo' },
  },
  bali: {
    dps: { dx: -14, dy: 6, anchor: 'end', text: '登巴萨机场' },
    ubud: { dx: 16, dy: -4, anchor: 'start', text: 'Alaya Ubud' },
    ayana: { dx: -14, dy: 18, anchor: 'end', text: 'AYANA' },
  },
  komodo: {
    lbj: { dx: 16, dy: -8, anchor: 'start', text: '科莫多机场' },
    katamaran: { dx: -16, dy: 12, anchor: 'end', text: 'Katamaran' },
  },
  full: {
    pvg: { dx: 16, dy: 4, anchor: 'start', text: '上海' },
    kul: { dx: -16, dy: 2, anchor: 'end', text: '吉隆坡' },
    sub: { dx: -16, dy: -2, anchor: 'end', text: '泗水' },
    bromo: null,
    ubud: null,
    ayana: null,
    dps: { dx: 0, dy: 26, anchor: 'middle', text: '巴厘岛' },
    lbj: { dx: 16, dy: 10, anchor: 'start', text: '下拉布安' },
    katamaran: null,
  },
}

const shownNodes = computed(() =>
  def.value.nodes.map((id) => {
    const n = NODES[id]
    const [x, y] = px(n.lng, n.lat)
    return { ...n, x, y, lab: LABELS[active.value]?.[id] ?? null }
  }),
)

/* ---------- 交互 ---------- */
const picked = ref<string>('')
const pickedNode = computed(() => (picked.value ? NODES[picked.value] : null))
/** 这个点在原文里对应的条目（用来给出原始 Google 地图链接） */
const pickedSegment = computed(() => {
  if (!picked.value) return null
  const leg = LEGS.find((l) => l.to === picked.value && l.mode === 'ground')
  return leg ? findSegment(leg.segmentId) : null
})

watch(active, () => (picked.value = ''))

const drawn = ref(false)
const syncNarrow = () => (narrow.value = mq.matches)

onMounted(() => {
  requestAnimationFrame(() => (drawn.value = true))
  syncNarrow()
  mq.addEventListener('change', syncNarrow)
})
onBeforeUnmount(() => mq.removeEventListener('change', syncNarrow))

const uid = Math.random().toString(36).slice(2, 8)
</script>

<template>
  <figure
    class="map"
    :class="{ 'map--still': still }"
    :style="{
      '--map-h': height || 'auto',
      '--map-h-m': heightMobile || undefined,
      '--map-ar': `${W} / ${frame.h}`,
    }"
  >
    <svg
      class="map__svg"
      :viewBox="`0 0 ${W} ${frame.h}`"
      :preserveAspectRatio="par"
      role="img"
      :aria-label="`行程路线图：${def.label}`"
    >
      <defs>
        <filter :id="`glow-${uid}`" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <!-- 取景框外的岛不能漏出来，否则 meet 留白处会画上别处的陆地 -->
        <clipPath :id="`clip-${uid}`">
          <rect x="0" y="0" :width="W" :height="frame.h" />
        </clipPath>
      </defs>
      <!-- 海是 .map 的 CSS 背景，不画在 SVG 里：SVG 只画岛和航线，
           铺底交给 CSS，容器什么比例都不会露出接缝。 -->

      <g :clip-path="`url(#clip-${uid})`">
      <!-- 岛：先一圈松石色浅滩，再铺沙色陆地 -->
      <g class="map__land">
        <path v-for="(d, i) in landPaths" :key="`reef${i}`" :d="d" class="map__reef" />
        <path v-for="(d, i) in landPaths" :key="`land${i}`" :d="d" class="map__isle" />
      </g>

      <!-- 航线 -->
      <g :class="['map__legs', { 'map__legs--in': drawn }]">
        <path
          v-for="l in shownLegs"
          :key="`h${l.segmentId}`"
          :d="legPath(l.from, l.to, l.mode)"
          class="map__halo"
          :class="{ 'is-dim': legDim(l.day) }"
          :filter="`url(#glow-${uid})`"
        />
        <path
          v-for="l in shownLegs"
          :key="l.segmentId"
          :d="legPath(l.from, l.to, l.mode)"
          class="map__leg"
          :class="[`map__leg--${l.mode}`, { 'is-dim': legDim(l.day) }]"
        />
      </g>

      <!-- 点与标注 -->
      <g class="map__nodes">
        <g
          v-for="n in shownNodes"
          :key="n.id"
          :class="['map__node', `is-${n.kind}`, { 'is-picked': picked === n.id }]"
          :tabindex="still ? undefined : 0"
          :role="still ? undefined : 'button'"
          :aria-label="n.label"
          @click="!still && (picked = picked === n.id ? '' : n.id)"
          @keydown.enter.prevent="!still && (picked = picked === n.id ? '' : n.id)"
          @keydown.space.prevent="!still && (picked = picked === n.id ? '' : n.id)"
        >
          <circle :cx="n.x" :cy="n.y" r="20" class="map__hit" />
          <circle v-if="n.kind === 'hotel'" :cx="n.x" :cy="n.y" r="12" class="map__pulse" />
          <circle :cx="n.x" :cy="n.y" :r="n.kind === 'hotel' ? 8 : 5.5" class="map__dot" />
          <text
            v-if="n.lab"
            :x="n.x + n.lab.dx"
            :y="n.y + n.lab.dy"
            :text-anchor="n.lab.anchor"
            class="map__label fr"
          >
            {{ n.lab.text }}
          </text>
        </g>
      </g>
      </g>
    </svg>

    <div v-if="switchable" class="map__views">
      <button
        v-for="v in VIEWS"
        :key="v.key"
        class="map__view"
        :class="{ 'is-on': active === v.key }"
        @click="active = v.key"
      >
        {{ v.label }}
      </button>
    </div>

    <Transition name="pop">
      <figcaption v-if="pickedNode" class="map__card">
        <p class="map__cardTitle fr">{{ pickedNode.label }}</p>
        <p class="map__cardMeta">
          {{ pickedNode.kind === 'hotel' ? '住宿' : '机场' }}
          <span v-if="pickedSegment"> · {{ pickedSegment.day.slice(5).replace('-', '月') }}日入住</span>
        </p>
        <a
          v-if="pickedSegment?.place"
          class="btn btn--sm btn--onDark"
          :href="pickedSegment.place.mapsUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          在 Google 地图打开
        </a>
        <button class="map__close" aria-label="关闭" @click="picked = ''">×</button>
      </figcaption>
    </Transition>

    <slot />
  </figure>
</template>

<style scoped>
.map {
  position: relative;
  margin: 0;
  width: 100%;
  height: var(--map-h);
  overflow: hidden;
  /* 黄昏的海：西北角亮松石压向东南的深靛，东边压一轮落日 */
  background:
    radial-gradient(ellipse 62% 78% at 88% 16%, rgba(255, 194, 75, 0.46), rgba(255, 61, 104, 0) 62%),
    linear-gradient(152deg, #17a5a8 0%, #0b6e7f 32%, #083f52 70%, #221a4d 100%);
}

.map__svg {
  display: block;
  width: 100%;
  height: 100%;
}

/* 浅滩：岛外圈一道饱和松石，收窄一点，岛的轮廓才利落不发虚 */
.map__reef {
  fill: none;
  stroke: rgba(25, 201, 180, 0.85);
  stroke-width: 7;
  stroke-linejoin: round;
}
.map__isle {
  fill: var(--sand);
  stroke: #fff6e6;
  stroke-width: 1.6;
  stroke-linejoin: round;
}

.map__halo {
  fill: none;
  stroke: rgba(255, 194, 75, 0.45);
  stroke-width: 7;
  stroke-linecap: round;
}
.map__leg {
  fill: none;
  stroke: #fff;
  stroke-width: 2.6;
  stroke-linecap: round;
}
.map__leg--flight {
  stroke-dasharray: 11 9;
}
.map__leg--ground {
  stroke: var(--hibiscus);
  stroke-width: 3.4;
}
.is-dim {
  opacity: 0.22;
}

/* 一次性的入场：航线从西向东描出来 */
.map__legs path {
  stroke-dasharray: 2600;
  stroke-dashoffset: 2600;
}
.map__legs--in path {
  animation: draw 1.5s cubic-bezier(0.33, 0.9, 0.4, 1) forwards;
}
.map__legs--in .map__leg--flight {
  animation: drawDash 1.5s cubic-bezier(0.33, 0.9, 0.4, 1) forwards;
}
@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes drawDash {
  to {
    stroke-dashoffset: 0;
    stroke-dasharray: 11 9;
  }
}

.map__hit {
  fill: transparent;
}
.map__node {
  cursor: pointer;
}
.map--still .map__node {
  cursor: default;
}
.map__dot {
  fill: var(--sun);
  stroke: #fff;
  stroke-width: 2.6;
  transition: r 0.18s;
}
.is-airport .map__dot {
  fill: #fff;
  stroke: var(--shallow-lite);
  stroke-width: 3.2;
}
.map__node:hover .map__dot,
.map__node.is-picked .map__dot {
  r: 11;
}
.map__pulse {
  fill: var(--sun);
  opacity: 0.28;
}
.map__node.is-picked .map__pulse {
  opacity: 0.5;
}

.map__label {
  fill: #fff;
  font-size: 27px;
  paint-order: stroke;
  stroke: rgba(4, 39, 46, 0.72);
  stroke-width: 6;
  stroke-linejoin: round;
  pointer-events: none;
}

.map__views {
  position: absolute;
  left: var(--gut);
  bottom: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.map__view {
  padding: 7px 15px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(6, 54, 63, 0.5);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
  transition: background 0.18s, color 0.18s, border-color 0.18s;
}
.map__view:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}
.map__view.is-on {
  background: #fff;
  border-color: #fff;
  color: var(--ocean);
}

.map__card {
  position: absolute;
  right: var(--gut);
  bottom: 22px;
  min-width: 232px;
  padding: 16px 44px 16px 18px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(6, 54, 63, 0.82);
  backdrop-filter: blur(14px);
  color: #fff;
}
.map__cardTitle {
  margin: 0;
  font-size: 20px;
  line-height: 1.3;
}
.map__cardMeta {
  margin: 2px 0 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.66);
}
.map__close {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 19px;
  line-height: 1;
}
.map__close:hover {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.18s, transform 0.18s;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 720px) {
  /*
   * 窄屏下让容器比例跟着地图走，而不是反过来：横版地图（印尼全境 2.47:1）塞进竖屏
   * 本来只能看见 25%，改成同比例后一点不裁。高度不足以撑满时由 min-height 兜底，
   * 多出来的部分被 meet 居中留白，露的是同一套海面渐变，看不出边界。
   * 需要固定高度的场景（首页 hero）传 heightMobile 盖过即可。
   */
  .map {
    height: var(--map-h-m, auto);
    aspect-ratio: var(--map-ar);
    min-height: 240px;
  }
  .map__label {
    font-size: 34px;
  }
  .map__views {
    left: 14px;
    right: 14px;
    bottom: 14px;
  }
  .map__view {
    font-size: 13px;
    min-height: 44px;
    padding: 10px 14px;
  }
  .map__card {
    left: 14px;
    right: 14px;
    bottom: 72px;
  }
  .map__close {
    top: 4px;
    right: 4px;
    width: 44px;
    height: 44px;
  }
}
</style>
