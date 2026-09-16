<script setup lang="ts">
/** 原文对照：网页上的每一项和 印尼.md 的原句并排放，方便核对有没有走样。 */
import { RouterLink } from 'vue-router'
import { SEGMENTS, findDay } from '@/data/trip'
import { prettyDate } from '@/utils/time'

const DERIVED = [
  ['当地时间', '拿原文的北京时间按时区偏移换算。泗水和布罗莫 UTC+7，巴厘岛、下拉布安、吉隆坡 UTC+8。'],
  ['航段时长', '原文的落地时间减起飞时间。'],
  ['中转停留', '前一段的落地时间减后一段的起飞时间。'],
  ['每天在哪、住几晚', '由当天的航班和入住酒店推出来。'],
  ['地图上的点', 'Plataran Bromo 和 Alaya Resort Ubud 的经纬度来自原文链接里的参数；另外七个点 2026 年 9 月 16 日查自 OpenStreetMap。'],
  ['机场地图链接', '原文只写了航站楼名字，链接是按机场名生成的 Google 地图搜索。'],
]
</script>

<template>
  <div>
    <header class="bleed head">
      <h1>原文长什么样</h1>
      <p class="lede">
        网页上的内容全部出自 <code>~/Desktop/印尼.md</code>。原文开头写着「以谷歌地图为准，时间为北京时间」，
        所以站内一律把原文数值当北京时间处理。
      </p>
    </header>

    <section class="bleed">
      <ol class="src">
        <li v-for="s in SEGMENTS" :key="s.id" :class="['tint', `tint--${findDay(s.day)!.chapter}`]">
          <div class="src__meta">
            <RouterLink :to="`/day/${s.day}`" class="src__day">{{ prettyDate(s.day) }}</RouterLink>
            <span class="src__title">{{ s.title }}</span>
          </div>
          <p class="src__text">{{ s.sourceText }}</p>
        </li>
      </ol>
    </section>

    <section class="bleed stack">
      <h2 class="h2">页面上唯一算出来的东西</h2>
      <dl class="drv">
        <template v-for="[k, v] in DERIVED" :key="k">
          <dt>{{ k }}</dt>
          <dd>{{ v }}</dd>
        </template>
      </dl>
      <p class="footnote drv__note">
        除这几项之外没有添加原文以外的内容 —— 没有餐厅推荐、景点、门票、天气或行李清单。备忘页里的内容是你自己写的。
      </p>
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
  max-width: 66ch;
}

.src {
  list-style: none;
  counter-reset: n;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 2px;
}
.src li {
  counter-increment: n;
  display: grid;
  grid-template-columns: minmax(200px, 300px) minmax(0, 1fr);
  gap: clamp(14px, 3vw, 40px);
  padding: 20px 22px;
  background: #fff;
  border-left: 5px solid var(--c);
}
.src li:first-child {
  border-radius: 16px 16px 0 0;
}
.src li:last-child {
  border-radius: 0 0 16px 16px;
}
.src__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.src__meta::before {
  content: counter(n);
  font-family: var(--display);
  font-variation-settings: 'SOFT' 50, 'WONK' 1, 'opsz' 144;
  font-size: 26px;
  line-height: 1;
  color: var(--c);
}
.src__day {
  font-size: 15px;
  color: var(--ink-2);
}
.src__title {
  font-size: 15px;
  color: var(--ink-3);
}
.src__text {
  margin: 0;
  font-size: 15.5px;
  line-height: 1.75;
  color: var(--ink-2);
  word-break: break-word;
}

.h2 {
  font-size: clamp(21px, 2.2vw, 27px);
  margin-bottom: 20px;
}
.drv {
  margin: 0 0 24px;
  display: grid;
  grid-template-columns: minmax(150px, 210px) minmax(0, 1fr);
  gap: 0 clamp(14px, 3vw, 36px);
}
.drv dt {
  padding: 13px 0;
  border-top: 1px solid var(--rule-soft);
  font-weight: 600;
  font-size: 16px;
}
.drv dd {
  margin: 0;
  padding: 13px 0;
  border-top: 1px solid var(--rule-soft);
  font-size: 15.5px;
  color: var(--ink-2);
}
.drv__note {
  padding-top: 20px;
  border-top: 1px solid var(--rule-soft);
}

@media (max-width: 680px) {
  .src li,
  .drv {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }
  .drv dd {
    border-top: 0;
    padding-top: 0;
  }
}
</style>
