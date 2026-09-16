<script setup lang="ts">
/**
 * 行程里的一段。左侧是一条贯穿全页的路线轨，右侧是内容 ——
 * 整页读下来就是这条线从上海走到下拉布安再走回来。
 */
import { computed } from 'vue'
import type { Segment } from '@/types/trip'
import { diffMinutes, formatDuration } from '@/utils/time'
import TimeBadge from './TimeBadge.vue'
import MapLink from './MapLink.vue'

const props = withDefaults(defineProps<{ segment: Segment; showSource?: boolean }>(), { showSource: false })

const duration = computed(() => {
  const { start, end } = props.segment
  return start && end ? formatDuration(diffMinutes(start, end)) : null
})
</script>

<template>
  <div class="leg" :class="`leg--${segment.kind}`">
    <div class="leg__rail" aria-hidden="true">
      <span class="leg__mark"></span>
    </div>

    <div class="leg__body">
      <!-- 航班：起飞 → 落地 -->
      <template v-if="segment.kind === 'flight' && segment.start && segment.end">
        <div class="fly">
          <div class="fly__end">
            <TimeBadge :tp="segment.start" size="xl" />
            <p class="fly__port">{{ segment.flight?.from.label }}</p>
            <p class="fly__city">{{ segment.flight?.from.city }}</p>
          </div>

          <div class="fly__mid">
            <span class="fly__dur fr">{{ duration }}</span>
            <span class="fly__line"></span>
          </div>

          <div class="fly__end">
            <TimeBadge :tp="segment.end" size="xl" />
            <p class="fly__port">{{ segment.flight?.to.label }}</p>
            <p class="fly__city">{{ segment.flight?.to.city }}</p>
          </div>
        </div>
        <p class="leg__who">
          <span class="fr leg__code">{{ segment.flight?.code }}</span>
          {{ segment.flight?.airline }}
        </p>
      </template>

      <!-- 住宿 -->
      <template v-else-if="segment.kind === 'stay'">
        <div class="stay">
          <TimeBadge v-if="segment.start" :tp="segment.start" />
          <p v-else class="stay__soft">{{ segment.timeText }}</p>
          <div class="stay__main">
            <h3 class="stay__name fr">{{ segment.place?.name }}</h3>
            <p class="stay__how">{{ segment.title.replace(segment.place?.name ?? '', '').trim() }}</p>
            <p v-if="segment.place?.address" class="stay__addr">{{ segment.place.address }}</p>
            <MapLink v-if="segment.place" :place="segment.place" />
          </div>
        </div>
      </template>

      <!-- 用餐（原文没给具体时间） -->
      <template v-else>
        <div class="meal">
          <p class="meal__when">{{ segment.timeText }}</p>
          <h3 class="meal__title">{{ segment.title }}</h3>
          <p v-if="segment.note" class="meal__note">{{ segment.note }}</p>
        </div>
      </template>

      <p v-if="showSource" class="leg__src">{{ segment.sourceText }}</p>
    </div>
  </div>
</template>

<style scoped>
.leg {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 22px;
}

/* 路线轨：这条线在每段之间是连着的 */
.leg__rail {
  position: relative;
  display: flex;
  justify-content: center;
}
.leg__rail::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: -1px;
  width: 2px;
  background: var(--rule);
}
.leg__mark {
  position: relative;
  margin-top: 12px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #fff;
  border: 2.5px solid var(--shallow);
}
.leg--stay .leg__mark {
  background: var(--sun);
  border-color: var(--sun);
  box-shadow: 0 0 0 5px rgba(255, 122, 69, 0.18);
}
.leg--meal .leg__mark {
  border-color: var(--rule);
  border-style: dashed;
}

.leg__body {
  padding-bottom: 42px;
  min-width: 0;
}

/* ---------- 航班 ---------- */
/* 色带通栏，但起降两端不跟着屏幕无限拉开，否则宽屏上中间一大片空 */
.fly {
  display: flex;
  align-items: flex-start;
  gap: clamp(16px, 3vw, 44px);
  max-width: 880px;
}
.fly__end {
  flex: none;
}
.fly__port {
  margin: 10px 0 0;
  font-size: 16.5px;
  font-weight: 600;
}
.fly__city {
  margin: 0;
  font-size: 14px;
  color: var(--ink-3);
}
.fly__mid {
  flex: 1;
  min-width: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding-top: 14px;
}
.fly__dur {
  font-size: 15px;
  color: var(--ink-2);
}
.fly__line {
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, var(--rule), var(--shallow-lite), var(--rule));
  border-radius: 2px;
}
.leg__who {
  margin: 16px 0 0;
  font-size: 15px;
  color: var(--ink-2);
}
.leg__code {
  font-size: 17px;
  font-weight: 600;
  color: var(--ink);
  margin-right: 9px;
}

/* ---------- 住宿 ---------- */
.stay {
  display: flex;
  gap: clamp(16px, 3vw, 40px);
  align-items: flex-start;
}
.stay__soft {
  margin: 4px 0 0;
  flex: none;
  font-size: 16px;
  color: var(--ink-2);
  white-space: nowrap;
}
.stay__main {
  min-width: 0;
}
.stay__name {
  font-size: clamp(22px, 2.5vw, 31px);
  font-variation-settings: 'SOFT' 70, 'WONK' 1, 'opsz' 120;
  font-weight: 500;
  line-height: 1.2;
}
.stay__how {
  margin: 6px 0 0;
  font-size: 15.5px;
  color: var(--ink-2);
}
.stay__addr {
  margin: 10px 0 16px;
  max-width: 48ch;
  font-size: 14.5px;
  line-height: 1.65;
  color: var(--ink-3);
}

/* ---------- 用餐 ---------- */
.meal__when {
  margin: 6px 0 0;
  font-size: 16px;
  color: var(--ink-2);
}
.meal__title {
  margin: 4px 0 0;
  font-size: 21px;
}
.meal__note {
  margin: 6px 0 0;
  font-size: 15.5px;
  color: var(--ink-2);
}

.leg__src {
  margin: 18px 0 0;
  padding-left: 14px;
  border-left: 2px solid var(--rule-soft);
  font-size: 14px;
  line-height: 1.65;
  color: var(--ink-3);
}

@media (max-width: 600px) {
  .leg {
    grid-template-columns: 20px minmax(0, 1fr);
    gap: 14px;
  }
  .fly {
    flex-wrap: wrap;
    gap: 14px;
  }
  .fly__mid {
    order: 3;
    width: 100%;
    flex-direction: row;
    align-items: center;
    padding-top: 0;
  }
  .stay {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
