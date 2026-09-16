<script setup lang="ts">
/**
 * Google 地图入口。页面加载时不请求任何 Google 资源：
 * 只有点「看看周边」才会创建 <iframe>，再点一次就把它卸载掉。
 */
import { computed, ref } from 'vue'
import type { Place } from '@/types/trip'

const props = withDefaults(defineProps<{ place: Place; compact?: boolean }>(), { compact: false })

const open = ref(false)

const embedSrc = computed(() => {
  const q = [props.place.name, props.place.address].filter(Boolean).join(' ')
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`
})
</script>

<template>
  <div class="ml">
    <div class="ml__row">
      <a class="btn btn--sm" :href="place.mapsUrl" target="_blank" rel="noopener noreferrer">
        在 Google 地图打开
      </a>
      <button v-if="!compact" class="ml__toggle" @click="open = !open">
        {{ open ? '收起周边' : '看看周边' }}
      </button>
    </div>

    <!-- v-if：没点过就没有 iframe，也就没有请求 -->
    <div v-if="open" class="ml__frame">
      <iframe
        :src="embedSrc"
        :title="`${place.name} 周边地图`"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen
      />
    </div>
  </div>
</template>

<style scoped>
.ml__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.ml__toggle {
  padding: 7px 4px;
  border: 0;
  background: transparent;
  color: var(--ink-3);
  font-size: 14.5px;
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-color: var(--rule);
}
.ml__toggle:hover {
  color: var(--shallow);
  text-decoration-color: currentColor;
}

.ml__frame {
  margin-top: 14px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--rule);
}
.ml__frame iframe {
  display: block;
  width: 100%;
  height: 300px;
  border: 0;
}
</style>
