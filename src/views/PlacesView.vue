<script setup lang="ts">
/** 住处。页面打开不向 Google 发任何请求，内嵌地图要点过才创建。 */
import { computed } from 'vue'
import { AIRPORT_PLACES, HOTELS, SEGMENTS } from '@/data/trip'
import type { Chapter, Place } from '@/types/trip'
import { findDay } from '@/data/trip'
import MapLink from '@/components/MapLink.vue'

interface Row {
  place: Place
  day: string
  chapter: Chapter
  nights: string
}

/** 住几晚：由下一次出现的航班或换酒店推出来 */
const NIGHTS: Record<string, string> = {
  'Plataran Bromo': '9月27日住到28日',
  'Alaya Resort Ubud': '9月28日住到29日',
  'AYANA Resort Bali': '9月29日住到10月1日',
  'Katamaran Hotel & Resort Komodo': '10月1日住到3日',
}

const hotels = computed<Row[]>(() =>
  Object.values(HOTELS).map((place) => {
    const seg = SEGMENTS.find((s) => s.place?.name === place.name)!
    return {
      place,
      day: seg.day,
      chapter: findDay(seg.day)!.chapter,
      nights: NIGHTS[place.name] ?? '',
    }
  }),
)
</script>

<template>
  <div>
    <header class="bleed head">
      <h1>四处住的地方</h1>
      <p class="lede">
        名字、地址、地图链接都是原文给的，点开就跳 Google 地图。住几晚是拿原文的入住日和下一班飞机推出来的。
      </p>
    </header>

    <section class="bleed">
      <div class="rows">
        <article v-for="h in hotels" :key="h.place.name" :class="['row', 'tint', `tint--${h.chapter}`]">
          <div class="row__band tint-field" aria-hidden="true"></div>
          <div class="row__body">
            <h2 class="row__name fr">{{ h.place.name }}</h2>
            <p class="row__when">{{ h.nights }}</p>
            <p class="row__addr">{{ h.place.address }}</p>
            <MapLink :place="h.place" />
          </div>
        </article>
      </div>
    </section>

    <section class="bleed stack">
      <h2 class="h2">路上经过的机场</h2>
      <p class="faint ports__note">原文只写了航站楼名字，所以这里是按机场名生成的搜索链接。</p>
      <div class="ports">
        <div v-for="a in AIRPORT_PLACES" :key="a.name" class="port">
          <span class="port__n">{{ a.name }}</span>
          <MapLink :place="a" compact />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.head {
  padding-block: clamp(40px, 5vw, 68px) 30px;
}
.head h1 {
  font-size: clamp(30px, 4vw, 46px);
}
.head .lede {
  margin: 12px 0 0;
}

.rows {
  display: grid;
  gap: 18px;
}
.row {
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr);
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--rule-soft);
}
.row__band {
  height: 100%;
}
.row__body {
  padding: 26px clamp(20px, 3vw, 34px) 28px;
}
.row__name {
  font-size: clamp(23px, 2.6vw, 32px);
  font-variation-settings: 'SOFT' 70, 'WONK' 1, 'opsz' 120;
  font-weight: 500;
  line-height: 1.2;
}
.row__when {
  margin: 8px 0 0;
  font-size: 16px;
  color: var(--c);
  font-weight: 600;
}
.row__addr {
  margin: 10px 0 18px;
  max-width: 54ch;
  font-size: 15px;
  line-height: 1.7;
  color: var(--ink-2);
}

.h2 {
  font-size: clamp(21px, 2.2vw, 27px);
}
.ports__note {
  margin: 8px 0 22px;
}
.ports {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1px;
  background: var(--rule-soft);
  border: 1px solid var(--rule-soft);
  border-radius: 16px;
  overflow: hidden;
}
.port {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: #fff;
}
.port__n {
  font-size: 17px;
  font-weight: 600;
}
</style>
