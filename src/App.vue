<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useTripStore } from '@/stores/tripStore'

const store = useTripStore()
const route = useRoute()

/** 首页顶栏浮在地图上，其余页面用浅色顶栏 */
const overMap = computed(() => route.name === 'home')

const NAV = [
  { to: '/', label: '总览' },
  { to: '/itinerary', label: '行程' },
  { to: '/map', label: '地图' },
  { to: '/places', label: '住处' },
  { to: '/notes', label: '备忘' },
]
</script>

<template>
  <div class="shell">
    <header class="bar bleed" :class="{ 'bar--over': overMap }">
      <RouterLink to="/" class="mark">
        <span class="mark__sun" aria-hidden="true"></span>
        <span class="mark__name fr">Indonesia</span>
      </RouterLink>

      <nav class="nav">
        <RouterLink v-for="i in NAV" :key="i.to" :to="i.to" class="nav__i">{{ i.label }}</RouterLink>
      </nav>

      <!-- 窄屏把「时间」两字收起来（CSS），省下的 26px 正好让五个导航项排得下。
           文字仍在 DOM 里，读屏拿到的还是完整标签 -->
      <button class="clock" @click="store.toggleClock()">
        {{ store.prefs.clock === 'local' ? '当地' : '北京' }}<span class="clock__suffix">时间</span>
      </button>
    </header>

    <main>
      <RouterView />
    </main>

    <footer class="foot bleed">
      <p>行程内容全部出自 <code>印尼.md</code>。<RouterLink to="/source">逐条对照原文</RouterLink></p>
    </footer>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.bar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 24px;
  height: var(--bar-h);
  background: rgba(237, 245, 243, 0.88);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--rule-soft);
  transition: background 0.25s, border-color 0.25s, color 0.25s;
}
.bar--over {
  background: transparent;
  border-color: transparent;
  color: #fff;
}

.mark {
  display: flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  flex: none;
}
.mark:hover {
  text-decoration: none;
}
.mark__sun {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--sun);
  box-shadow: 0 0 0 4px rgba(255, 122, 69, 0.22);
}
.mark__name {
  font-size: 21px;
  font-variation-settings: 'SOFT' 80, 'WONK' 1, 'opsz' 120;
}

.nav {
  display: flex;
  gap: 4px;
  margin-left: auto;
  overflow-x: auto;
  scrollbar-width: none;
}
.nav::-webkit-scrollbar {
  display: none;
}
.nav__i {
  padding: 7px 14px;
  border-radius: 999px;
  color: inherit;
  opacity: 0.7;
  font-size: 15.5px;
  white-space: nowrap;
  transition: opacity 0.16s, background 0.16s;
}
.nav__i:hover {
  opacity: 1;
  text-decoration: none;
  background: rgba(6, 54, 63, 0.07);
}
.bar--over .nav__i:hover {
  background: rgba(255, 255, 255, 0.16);
}
.nav__i.router-link-exact-active {
  opacity: 1;
  font-weight: 600;
  background: rgba(6, 54, 63, 0.09);
}
.bar--over .nav__i.router-link-exact-active {
  background: rgba(255, 255, 255, 0.2);
}

.clock {
  flex: none;
  padding: 7px 15px;
  border-radius: 999px;
  border: 1px solid currentColor;
  background: transparent;
  color: inherit;
  opacity: 0.62;
  font-size: 14px;
  transition: opacity 0.16s;
}
.clock:hover {
  opacity: 1;
}

.foot {
  margin-top: auto;
  padding-block: 34px 48px;
  border-top: 1px solid var(--rule-soft);
  color: var(--ink-3);
  font-size: 14.5px;
}
.foot p {
  margin: 0;
}

/*
 * 窄屏顶栏收成一行。原来折成两行、sticky 常驻要吃掉 110px（844 高的 13%），
 * 而单行只要 56px。代价是五行导航放不下，让它横向滚动；右侧渐隐提示还能滑。
 * 44px 是 iOS 建议的触摸目标下限，导航和时钟都按这个抬高。
 */
@media (max-width: 760px) {
  .bar {
    gap: 6px;
    padding-block: 0;
  }
  .nav {
    flex: 1 1 auto;
    min-width: 0;
    margin-left: auto;
    gap: 0;
    -webkit-mask-image: linear-gradient(90deg, #000 0, #000 calc(100% - 20px), transparent 100%);
    mask-image: linear-gradient(90deg, #000 0, #000 calc(100% - 20px), transparent 100%);
  }
  /*
   * 五个导航项 + 时钟要挤进一行。按桌面尺寸算是 382px，而 360px 的机器（印尼主流
   * Android 宽度）内容区只有 316.8px，会把「备忘」整个挤出屏幕。
   * 收窄后：太阳 13 + 间隙 12 + 导航 5×44=220 + 时钟 46 = 291，360 下留 26px 余量。
   */
  .nav__i {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 8px;
    font-size: 14px;
  }
  .clock {
    flex: none;
    min-height: 44px;
    margin-left: 0;
    padding: 0 9px;
    font-size: 13px;
  }
  .clock__suffix {
    display: none;
  }
}

/* 390px 下 wordmark 会挤掉导航，窄到这个程度就只留太阳标记 */
@media (max-width: 560px) {
  .mark__name {
    display: none;
  }
}
</style>
