<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { DAYS, DEPARTURE_AT, SEGMENTS } from '@/data/trip'
import { CHAPTERS, TIME_ZONES, type Chapter } from '@/types/trip'
import { countdownTo, nowInZone, prettyDate, weekdayOf } from '@/utils/time'
import RouteMap from '@/components/RouteMap.vue'

const now = ref(new Date())
let timer: number | undefined
onMounted(() => {
  timer = window.setInterval(() => (now.value = new Date()), 1000)
})
onBeforeUnmount(() => timer && window.clearInterval(timer))

const cd = computed(() => countdownTo(DEPARTURE_AT, now.value))
const flying = computed(() => cd.value.totalMs === 0)
const pad = (n: number) => String(n).padStart(2, '0')

const flights = SEGMENTS.filter((s) => s.kind === 'flight').length

/** 把八天按章节聚起来，每章知道自己横跨哪几天 */
const chapters = computed(() => {
  const order: Chapter[] = ['depart', 'java', 'bali', 'komodo', 'home']
  return order
    .map((key) => {
      const days = DAYS.filter((d) => d.chapter === key)
      return { ...CHAPTERS[key], days }
    })
    .filter((c) => c.days.length > 0)
})

const CLOCKS = ['CST', 'WIB', 'WITA'] as const
</script>

<template>
  <div>
    <!-- 整屏地图开场：这趟旅行本身就是一条向东的线 -->
    <section class="hero">
      <RouteMap view="indonesia" height="min(82vh, 760px)" height-mobile="340px" />
      <div class="hero__veil" aria-hidden="true"></div>

      <div class="hero__text bleed">
        <p class="hero__when">
          <span class="fr">2026</span> 年 <span class="fr">9</span> 月 <span class="fr">27</span> 日 起
        </p>
        <h1 class="hero__title">一路向东</h1>
        <p class="hero__sub">
          八天，从泗水一直走到下拉布安，<span class="fr">{{ flights }}</span> 段飞行、<span class="fr">4</span> 处住宿。
        </p>
      </div>

      <div class="hero__count">
        <p class="hero__countLabel">{{ flying ? '已经在路上' : '距起飞' }}</p>
        <p v-if="!flying" class="hero__clock fr">
          {{ cd.days }}<small>天</small>
          {{ pad(cd.hours) }}:{{ pad(cd.minutes) }}:{{ pad(cd.seconds) }}
        </p>
        <p class="hero__countFoot">D7331 浦东 T2 起飞</p>
      </div>
    </section>

    <!-- 五段旅程 -->
    <section class="bleed stack">
      <h2 class="h-sec">这八天分成五段</h2>
      <ol class="chaps">
        <li v-for="c in chapters" :key="c.key" :class="['chap', 'tint', 'tint-field', `tint--${c.key}`]">
          <p class="chap__dates fr">
            {{ c.days[0].date.slice(5).replace('-', '.') }}<template v-if="c.days.length > 1">–{{
              c.days[c.days.length - 1].date.slice(5).replace('-', '.')
            }}</template>
          </p>
          <h3 class="chap__title">{{ c.title }}</h3>
          <p class="chap__place">{{ c.place }}</p>
        </li>
      </ol>
    </section>

    <!-- 八天 -->
    <section class="bleed stack days-sec">
      <div class="h-row">
        <h2 class="h-sec">八天怎么走</h2>
        <RouterLink class="btn btn--sm" to="/itinerary">看全部安排</RouterLink>
      </div>
      <div class="days">
        <RouterLink
          v-for="d in DAYS"
          :key="d.date"
          :to="`/day/${d.date}`"
          :class="['day', 'tint', `tint--${d.chapter}`, { 'day--blank': d.empty }]"
        >
          <p class="day__n fr">{{ d.date.slice(8) }}</p>
          <p class="day__m">{{ prettyDate(d.date).split('月')[0] }}月 {{ weekdayOf(d.date) }}</p>
          <p class="day__w">{{ d.where }}</p>
          <p class="day__c">
            <template v-if="d.segments.length">{{ d.segments.length }} 项安排</template>
            <template v-else-if="d.arrivals.length">清晨落地</template>
            <template v-else>整天空着</template>
          </p>
        </RouterLink>
      </div>
    </section>

    <!-- 三地时间 -->
    <section class="bleed stack clocks-sec">
      <h2 class="h-sec">三地此刻</h2>
      <div class="clocks">
        <div v-for="z in CLOCKS" :key="z" class="clk">
          <p class="clk__t fr">{{ nowInZone(z, now) }}</p>
          <p class="clk__n">{{ TIME_ZONES[z].label }}</p>
          <p class="clk__w">{{ TIME_ZONES[z].where }}</p>
        </div>
      </div>
      <p class="footnote clocks-sec__note">
        原文写明时间以北京时间为准。泗水和布罗莫在 UTC+7，比北京晚一小时；巴厘岛、下拉布安和吉隆坡都是
        UTC+8，和北京一样。页面上每个时刻都能切成当地时间看。
      </p>
    </section>
  </div>
</template>

<style scoped>
/* ---------- 开场 ---------- */
.hero {
  position: relative;
  margin-top: calc(-1 * var(--bar-h));
  background: var(--ocean);
}
.hero__veil {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(to bottom, rgba(8, 40, 58, 0.55) 0%, transparent 32%),
    linear-gradient(to top, rgba(14, 20, 58, 0.86) 0%, rgba(10, 43, 51, 0.35) 34%, transparent 52%);
}
.hero__text {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 118px;
  color: #fff;
  pointer-events: none;
}
.hero__when {
  margin: 0 0 10px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.72);
}
.hero__title {
  font-size: clamp(52px, 10vw, 132px);
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 0.98;
  text-shadow: 0 2px 30px rgba(4, 39, 46, 0.4);
}
.hero__sub {
  margin: 16px 0 0;
  max-width: 34ch;
  font-size: clamp(16px, 1.5vw, 19px);
  color: rgba(255, 255, 255, 0.88);
}

.hero__count {
  position: absolute;
  right: var(--gut);
  top: 104px;
  text-align: right;
  color: #fff;
}
.hero__countLabel {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}
.hero__clock {
  margin: 2px 0 0;
  font-size: clamp(30px, 4.2vw, 50px);
  line-height: 1.1;
  font-variation-settings: 'SOFT' 40, 'WONK' 0, 'opsz' 144;
  font-weight: 400;
}
.hero__clock small {
  font-size: 0.42em;
  opacity: 0.66;
  margin: 0 0.16em 0 0.04em;
  font-family: var(--body);
}
.hero__countFoot {
  margin: 4px 0 0;
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.58);
}

/* ---------- 通用小标题 ---------- */
.h-sec {
  font-size: clamp(22px, 2.4vw, 29px);
  margin-bottom: 26px;
}
.h-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
}
.h-row .h-sec {
  margin-bottom: 26px;
}

/* ---------- 五段 ---------- */
.chaps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 4px;
}
.chap {
  padding: 30px 22px 60px;
  border-radius: 4px;
}
.chaps li:first-child {
  border-radius: 20px 4px 4px 20px;
}
.chaps li:last-child {
  border-radius: 4px 20px 20px 4px;
}
.chap__dates {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
}
.chap__title {
  margin: 8px 0 4px;
  font-size: 27px;
}
.chap__place {
  margin: 0;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.82);
}

/* ---------- 八天 ---------- */
.days-sec {
  background: #fff;
  border-block: 1px solid var(--rule-soft);
}
.days {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(224px, 1fr));
  gap: 1px;
  background: var(--rule-soft);
  border: 1px solid var(--rule-soft);
  border-radius: 16px;
  overflow: hidden;
}
.day {
  position: relative;
  padding: 22px 20px 24px;
  background: #fff;
  color: var(--ink);
  transition: background 0.16s;
}
/* 顶边一道本段的色，鼠标经过时整块淡染成那个色 */
.day::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 4px;
  background-image: linear-gradient(90deg, var(--c1), var(--c2));
}
.day:hover {
  background: color-mix(in srgb, var(--c) 9%, #fff);
  text-decoration: none;
}
.day__n {
  margin: 0;
  font-size: 42px;
  line-height: 1;
  color: var(--c);
  font-variation-settings: 'SOFT' 50, 'WONK' 1, 'opsz' 144;
  font-weight: 400;
}
.day__m {
  margin: 2px 0 12px;
  font-size: 14px;
  color: var(--ink-3);
}
.day__w {
  margin: 0;
  font-size: 15.5px;
  line-height: 1.5;
}
.day__c {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--ink-3);
}
.day--blank .day__w {
  color: var(--ink-2);
}

/* ---------- 时钟 ---------- */
.clocks {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 22px;
  margin-bottom: 26px;
}
.clk__t {
  margin: 0;
  font-size: clamp(32px, 3.6vw, 44px);
  line-height: 1.1;
  font-variation-settings: 'SOFT' 40, 'WONK' 0, 'opsz' 144;
  font-weight: 300;
}
.clk__n {
  margin: 4px 0 0;
  font-size: 15.5px;
}
.clk__w {
  margin: 0;
  font-size: 14px;
  color: var(--ink-3);
}
.clocks-sec__note {
  border-top: 1px solid var(--rule-soft);
  padding-top: 18px;
}

@media (max-width: 860px) {
  .hero__count {
    top: auto;
    bottom: 22px;
    right: var(--gut);
    text-align: right;
  }
  .hero__text {
    bottom: 128px;
  }
}
@media (max-width: 560px) {
  .hero__count {
    left: var(--gut);
    text-align: left;
  }
  .hero__text {
    bottom: 150px;
  }
}

/*
 * 窄屏 hero 降到 340px，地图按 18 天全程的宽度完整装下（约 158px 高，居中），
 * 所以文字得往下让，否则会钻到 sticky 顶栏底下。倒计时压到底部一行。
 */
@media (max-width: 760px) {
  /*
   * 桌面 hero 有 760px 高，视野切换 chip 落在文字下方 96px 处互不打扰；
   * 340px 的移动版里 chip 必然和倒计时叠在一起，所以收掉。
   * 地图页有完整的切换器，这里只是背景图。
   */
  .hero :deep(.map__views) {
    display: none;
  }
  /* 标题正好压在地图带上，靠加深底部这层纱把字托出来 */
  .hero__veil {
    background:
      linear-gradient(to bottom, rgba(8, 40, 58, 0.55) 0%, transparent 26%),
      linear-gradient(
        to top,
        rgba(14, 20, 58, 0.92) 0%,
        rgba(10, 43, 51, 0.62) 46%,
        transparent 68%
      );
  }
  .hero__text {
    bottom: 112px;
  }
  .hero__count {
    top: auto;
    bottom: 18px;
    left: var(--gut);
    right: var(--gut);
    text-align: left;
  }
}
</style>
