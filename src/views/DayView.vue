<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { DAYS, findDay } from '@/data/trip'
import { CHAPTERS, TIME_ZONES } from '@/types/trip'
import { prettyDate, tzDelta, weekdayOf } from '@/utils/time'
import TripLeg from '@/components/TripLeg.vue'
import TimeBadge from '@/components/TimeBadge.vue'
import RouteMap from '@/components/RouteMap.vue'
import type { MapView } from '@/data/geo'
import { useTripStore } from '@/stores/tripStore'

const props = defineProps<{ date: string }>()
const store = useTripStore()

const day = computed(() => findDay(props.date))
const pos = computed(() => DAYS.findIndex((d) => d.date === props.date))
const prev = computed(() => (pos.value > 0 ? DAYS[pos.value - 1] : null))
const next = computed(() => (pos.value >= 0 && pos.value < DAYS.length - 1 ? DAYS[pos.value + 1] : null))

/**
 * 当天的地图用全境视野 + 高亮当天的腿：条幅很扁，岛级放大会被裁成一条缝，
 * 而且看整条线走到哪了本来就比看单个岛有用。
 */
const mapView: MapView = 'indonesia'

const draft = ref('')
const dayTodos = computed(() => (day.value ? store.todosForDay(day.value.date) : []))

function submit() {
  if (!day.value) return
  store.addTodo(draft.value, day.value.date)
  draft.value = ''
}
</script>

<template>
  <div v-if="day" :class="['d', 'tint', `tint--${day.chapter}`]">
    <header class="dhead tint-field">
      <div class="bleed dhead__in">
        <p class="dhead__chap">{{ CHAPTERS[day.chapter].title }}</p>
        <h1 class="dhead__title">
          <span class="fr dhead__num">{{ day.date.slice(8) }}</span>
          <span class="dhead__mon">{{ prettyDate(day.date).split('月')[0] }}月</span>
          <span class="dhead__wd">{{ weekdayOf(day.date) }}</span>
        </h1>
        <p class="dhead__where">{{ day.where }}</p>
        <p class="dhead__tz">
          {{ TIME_ZONES[day.tz].label }} UTC+{{ TIME_ZONES[day.tz].offset }}，{{ tzDelta(day.tz) }}
        </p>
      </div>
    </header>

    <section class="dmap">
      <RouteMap :view="mapView" :focus-day="day.date" height="min(46vh, 380px)" :switchable="false" />
    </section>

    <section class="bleed dbody">
      <div v-for="a in day.arrivals" :key="`a${a.id}`" class="land">
        <TimeBadge v-if="a.end" :tp="a.end" size="xl" />
        <p>{{ a.flight?.code }} 落地 {{ a.flight?.to.label }}</p>
      </div>

      <div v-if="day.segments.length" class="dlegs">
        <TripLeg v-for="s in day.segments" :key="s.id" :segment="s" />
      </div>

      <p v-else-if="!day.arrivals.length" class="empty-note">
        原文这天没写安排。整天是空的 —— 想到什么，记在下面。
      </p>

      <section class="todo">
        <h2 class="todo__h">这天的备忘</h2>
        <form class="todo__form" @submit.prevent="submit">
          <input v-model="draft" type="text" placeholder="想起要做的事，写在这里" />
          <button class="btn btn--solid" type="submit">记下</button>
        </form>
        <ul v-if="dayTodos.length" class="todo__list">
          <li v-for="t in dayTodos" :key="t.id" :class="{ done: t.done }">
            <input type="checkbox" :checked="t.done" @change="store.toggleTodo(t.id)" />
            <span>{{ t.text }}</span>
            <button class="todo__del" @click="store.removeTodo(t.id)">删掉</button>
          </li>
        </ul>
        <p v-else class="faint todo__hint">只存在这台设备的浏览器里。</p>
      </section>

      <nav class="pager">
        <RouterLink v-if="prev" class="btn" :to="`/day/${prev.date}`">
          前一天 {{ prettyDate(prev.date) }}
        </RouterLink>
        <span v-else></span>
        <RouterLink v-if="next" class="btn" :to="`/day/${next.date}`">
          后一天 {{ prettyDate(next.date) }}
        </RouterLink>
      </nav>
    </section>
  </div>

  <div v-else class="bleed stack">
    <p class="empty-note">没有这一天（{{ date }}）。<RouterLink to="/itinerary">回到行程</RouterLink></p>
  </div>
</template>

<style scoped>
.dhead {
  margin-top: -68px;
}
.dhead__in {
  padding-block: calc(68px + clamp(30px, 4vw, 52px)) clamp(34px, 4vw, 56px);
}
.dhead__chap {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 650;
  color: rgba(255, 255, 255, 0.78);
}
.dhead__title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}
.dhead__num {
  font-size: clamp(56px, 9vw, 104px);
  line-height: 0.9;
  font-variation-settings: 'SOFT' 60, 'WONK' 1, 'opsz' 144;
  font-weight: 300;
}
.dhead__mon {
  font-size: 22px;
  font-weight: 500;
}
.dhead__wd {
  font-size: 18px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.72);
}
.dhead__where {
  margin: 14px 0 0;
  font-size: clamp(17px, 1.7vw, 21px);
}
.dhead__tz {
  margin: 4px 0 0;
  font-size: 14.5px;
  color: rgba(255, 255, 255, 0.7);
}

.dmap {
  background: var(--ocean);
}

.dbody {
  padding-block: clamp(36px, 4vw, 56px) 80px;
}

.land {
  display: flex;
  align-items: baseline;
  gap: 18px;
  padding-bottom: 34px;
  border-bottom: 1px solid var(--rule-soft);
  margin-bottom: 34px;
}
.land p {
  margin: 0;
  font-size: 17px;
  color: var(--ink-2);
}

.todo {
  margin-top: 26px;
  padding-top: 30px;
  border-top: 1px solid var(--rule-soft);
}
.todo__h {
  font-size: 19px;
  margin-bottom: 16px;
}
.todo__form {
  display: flex;
  gap: 10px;
  max-width: 560px;
}
.todo__form input {
  flex: 1;
}
.todo__hint {
  margin: 12px 0 0;
}
.todo__list {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  max-width: 560px;
}
.todo__list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--rule-soft);
  font-size: 16px;
}
.todo__list li.done span {
  text-decoration: line-through;
  color: var(--ink-3);
}
.todo__list li span {
  flex: 1;
}
.todo__list input {
  width: 17px;
  height: 17px;
  accent-color: var(--shallow);
}
.todo__del {
  border: 0;
  background: transparent;
  color: var(--ink-3);
  font-size: 14px;
}
.todo__del:hover {
  color: var(--sun);
}

.pager {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 46px;
}
</style>
