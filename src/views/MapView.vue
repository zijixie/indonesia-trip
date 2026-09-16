<script setup lang="ts">
import { ref } from 'vue'
import RouteMap from '@/components/RouteMap.vue'
import { BASEMAP_SOURCE, LEGS, NODES } from '@/data/geo'
import type { MapView } from '@/data/geo'

const view = ref<MapView>('indonesia')

const flights = LEGS.filter((l) => l.mode === 'flight')
const grounds = LEGS.filter((l) => l.mode === 'ground')
</script>

<template>
  <div>
    <section class="mapWrap">
      <RouteMap :view="view" height="min(76vh, 780px)" />
    </section>

    <section class="bleed stack">
      <div class="cols">
        <div>
          <h2 class="h">虚线是飞的</h2>
          <ul class="list">
            <li v-for="l in flights" :key="l.segmentId">
              <span class="fr code">{{ l.via }}</span>
              {{ NODES[l.from].label }} 到 {{ NODES[l.to].label }}
            </li>
          </ul>
        </div>
        <div>
          <h2 class="h h--sun">实线是地面走的</h2>
          <ul class="list">
            <li v-for="l in grounds" :key="l.segmentId">
              <span class="way">{{ l.via }}</span>
              {{ NODES[l.from].label }} 到 {{ NODES[l.to].label }}
            </li>
          </ul>
        </div>
      </div>

      <p class="footnote note">
        这张图是本地画的 SVG，打开不会连任何地图服务。海岸线用的是
        {{ BASEMAP_SOURCE.split(',')[0] }}（公有领域）。Plataran Bromo 和 Alaya Resort Ubud
        的经纬度直接来自原文 Google 地图链接里的参数，其余七个点是 2026 年 9 月 16 日在
        OpenStreetMap 上查的。点地图上任意一个住宿点，可以跳到 Google 地图。
      </p>
    </section>
  </div>
</template>

<style scoped>
/* 这一页顶栏是不透明的，地图不能钻到它底下，否则上海会被顶栏盖住 */
.mapWrap {
  background: var(--ocean);
}

.cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: clamp(28px, 5vw, 72px);
  margin-bottom: 40px;
}

.h {
  font-size: 21px;
  padding-bottom: 12px;
  border-bottom: 3px dashed var(--shallow-lite);
  margin-bottom: 16px;
}
.h--sun {
  border-bottom: 3px solid var(--sun);
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.list li {
  padding: 11px 0;
  border-bottom: 1px solid var(--rule-soft);
  font-size: 16px;
}
.code {
  display: inline-block;
  min-width: 82px;
  font-size: 17px;
  font-weight: 600;
}
.way {
  display: inline-block;
  min-width: 82px;
  color: var(--sun);
  font-weight: 600;
}

.note {
  padding-top: 24px;
  border-top: 1px solid var(--rule-soft);
}
</style>
