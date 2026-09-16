<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { DAYS, SEGMENTS } from '@/data/trip'
import type { Segment } from '@/types/trip'
import { CHAPTERS } from '@/types/trip'
import { diffMinutes, formatDuration, prettyDate, weekdayOf } from '@/utils/time'
import TripLeg from '@/components/TripLeg.vue'
import TimeBadge from '@/components/TimeBadge.vue'

const showSource = ref(false)

/** 相邻两段之间的空档，由原文时间相减得出 */
function gapBefore(seg: Segment): { text: string; at: string } | null {
  const i = SEGMENTS.findIndex((s) => s.id === seg.id)
  const prev = SEGMENTS[i - 1]
  if (!prev?.end || !seg.start) return null
  const mins = diffMinutes(prev.end, seg.start)
  if (mins <= 0) return null
  return { text: formatDuration(mins), at: prev.flight?.to.label ?? prev.place?.name ?? '' }
}

/** 章节在哪一天开始，用来插入分节标题 */
const chapterStart = computed(() => {
  const seen = new Set<string>()
  const map: Record<string, string> = {}
  for (const d of DAYS) {
    if (!seen.has(d.chapter)) {
      seen.add(d.chapter)
      map[d.date] = d.chapter
    }
  }
  return map
})
</script>

<template>
  <div class="itin">
    <header class="bleed head">
      <div class="head__text">
        <h1>八天的全部安排</h1>
        <p class="lede">
          十一项，条条来自 <code>印尼.md</code>。时刻是原文给的北京时间，顶栏可以切成当地时间看。
        </p>
      </div>
      <label class="src">
        <input v-model="showSource" type="checkbox" />
        对照原文
      </label>
    </header>

    <div v-for="d in DAYS" :key="d.date" :class="['tint', `tint--${d.chapter}`]">
      <!-- 换岛了就换一块颜色，整页读下来是一路变色 -->
      <div v-if="chapterStart[d.date]" class="chapMark tint-field">
        <div class="bleed chapMark__in">
          <h2 class="chapMark__label">{{ CHAPTERS[d.chapter].title }}</h2>
          <p class="chapMark__place">{{ CHAPTERS[d.chapter].place }}</p>
        </div>
      </div>

      <section class="day bleed">
        <RouterLink class="day__head" :to="`/day/${d.date}`">
          <span class="day__num fr">{{ d.date.slice(8) }}</span>
          <span class="day__mon">{{ prettyDate(d.date).split('月')[0] }}月</span>
          <span class="day__wd">{{ weekdayOf(d.date) }}</span>
          <span class="day__where">{{ d.where }}</span>
        </RouterLink>

        <div class="day__legs">
          <div v-for="a in d.arrivals" :key="`a${a.id}`" class="landing">
            <div class="landing__rail" aria-hidden="true"><span></span></div>
            <div class="landing__body">
              <TimeBadge v-if="a.end" :tp="a.end" size="xl" />
              <p class="landing__txt">
                {{ a.flight?.code }} 落地 {{ a.flight?.to.label }}，回到上海
              </p>
            </div>
          </div>

          <template v-for="s in d.segments" :key="s.id">
            <div v-if="gapBefore(s)" class="gap">
              <div class="gap__rail" aria-hidden="true"></div>
              <p class="gap__txt">
                在 {{ gapBefore(s)!.at }} 停 <span class="fr">{{ gapBefore(s)!.text }}</span>
              </p>
            </div>
            <TripLeg :segment="s" :show-source="showSource" />
          </template>

          <div v-if="d.empty" class="blank">
            <div class="blank__rail" aria-hidden="true"></div>
            <p class="blank__txt">整天空着 —— 原文没写安排</p>
          </div>
        </div>
      </section>
    </div>

    <p class="bleed footnote tail">
      时长、停留时间、当地时间都是拿原文的时刻相减或换时区算出来的；其余文字没有超出原文。
      <RouterLink to="/source">逐条对照</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.itin {
  padding-bottom: 60px;
}

.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  padding-block: clamp(40px, 5vw, 68px) 30px;
}
.head h1 {
  font-size: clamp(30px, 4vw, 46px);
}
.head .lede {
  margin: 12px 0 0;
}
.src {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 15px;
  color: var(--ink-2);
  cursor: pointer;
  white-space: nowrap;
}
.src input {
  width: 17px;
  height: 17px;
  accent-color: var(--shallow);
}

/* 换岛分节：整条通栏色带 */
.chapMark {
  margin-top: 34px;
}
.chapMark__in {
  padding-block: clamp(30px, 4vw, 52px);
}
.chapMark__label {
  font-size: clamp(28px, 3.6vw, 42px);
  line-height: 1.1;
}
.chapMark__place {
  margin: 8px 0 0;
  font-size: 16.5px;
  color: rgba(255, 255, 255, 0.85);
}

/* 每天 */
.day {
  padding-top: 26px;
}
.day__head {
  display: flex;
  align-items: baseline;
  gap: 11px;
  padding: 10px 0 20px;
  color: var(--ink);
  flex-wrap: wrap;
}
.day__head:hover {
  text-decoration: none;
}
.day__head:hover .day__where {
  color: var(--shallow);
}
.day__num {
  font-size: 40px;
  line-height: 1;
  font-variation-settings: 'SOFT' 50, 'WONK' 1, 'opsz' 144;
  font-weight: 400;
  color: var(--c);
}
.day__mon {
  font-size: 16px;
  color: var(--ink-2);
}
.day__wd {
  font-size: 15px;
  color: var(--ink-3);
}
.day__where {
  font-size: 15.5px;
  color: var(--ink-2);
  margin-left: 6px;
  transition: color 0.16s;
}

/* 空档 / 空白天 / 落地：都挂在同一条轨上 */
.gap,
.blank,
.landing {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 22px;
}
.gap__rail,
.blank__rail {
  position: relative;
}
.gap__rail::before,
.blank__rail::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -1px;
  bottom: -1px;
  width: 2px;
  margin-left: -1px;
  background: repeating-linear-gradient(var(--rule) 0 5px, transparent 5px 11px);
}
.gap__txt {
  margin: 0;
  padding-bottom: 30px;
  font-size: 15px;
  color: var(--ink-3);
}
.gap__txt .fr {
  font-size: 16px;
  color: var(--ink-2);
}
.blank__txt {
  margin: 0;
  padding-bottom: 40px;
  font-size: 16px;
  color: var(--ink-3);
}

.landing__rail {
  position: relative;
  display: flex;
  justify-content: center;
}
.landing__rail::before {
  content: '';
  position: absolute;
  top: 0;
  height: 20px;
  width: 2px;
  background: var(--rule);
}
.landing__rail span {
  position: relative;
  margin-top: 12px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--shallow);
  border: 2.5px solid var(--shallow);
}
.landing__body {
  padding-bottom: 40px;
}
.landing__txt {
  margin: 8px 0 0;
  font-size: 16px;
  color: var(--ink-2);
}

.tail {
  padding-top: 30px;
  border-top: 1px solid var(--rule-soft);
}

@media (max-width: 600px) {
  .gap,
  .blank,
  .landing {
    grid-template-columns: 20px minmax(0, 1fr);
    gap: 14px;
  }
  .day__num {
    font-size: 32px;
  }
}
</style>
