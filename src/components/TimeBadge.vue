<script setup lang="ts">
/** 时刻。原文给的是北京时间，当地时间按时区偏移换算。两地同为 UTC+8 时不重复显示。 */
import { computed } from 'vue'
import type { TimePoint } from '@/types/trip'
import { TIME_ZONES } from '@/types/trip'
import { beijingTime, localTime, sameAsBeijing } from '@/utils/time'
import { useTripStore } from '@/stores/tripStore'

const props = defineProps<{ tp: TimePoint; size?: 'xl' | 'md' }>()
const store = useTripStore()

const beijing = computed(() => store.prefs.clock === 'beijing')
const main = computed(() => (beijing.value ? beijingTime(props.tp) : localTime(props.tp)))
const alt = computed(() => (beijing.value ? localTime(props.tp) : beijingTime(props.tp)))
const altWhere = computed(() => (beijing.value ? TIME_ZONES[props.tp.tz].where : '北京'))
const showAlt = computed(() => !sameAsBeijing(props.tp.tz))
</script>

<template>
  <span class="t" :class="{ 't--xl': size === 'xl' }">
    <span class="t__v fr">{{ main }}</span>
    <span v-if="showAlt" class="t__alt">{{ altWhere }} {{ alt }}</span>
  </span>
</template>

<style scoped>
.t {
  display: inline-flex;
  flex-direction: column;
  line-height: 1.1;
}
.t__v {
  font-size: 25px;
  font-variation-settings: 'SOFT' 40, 'WONK' 0, 'opsz' 144;
  font-weight: 400;
}
.t--xl .t__v {
  font-size: clamp(34px, 3.4vw, 44px);
}
.t__alt {
  margin-top: 4px;
  font-size: 13px;
  color: var(--ink-3);
  white-space: nowrap;
}
</style>
