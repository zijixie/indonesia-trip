# 印尼行程 (2026.09.27 — 10.04)

Vue 3 + TypeScript + Vite 单页应用，数据源唯一：`~/Desktop/印尼.md`。

## 本地运行

```bash
cd ~/Desktop/indonesia-trip
npm install
npm run dev        # http://localhost:5180
```

其他命令：

```bash
npm run typecheck  # vue-tsc --noEmit
npm run build      # 类型检查 + 产物打包到 dist/
npm run preview    # 预览 dist/
```

## 三条硬约束

**1. 不编造内容。** 页面上的航班号、航司、时间、机场、酒店名、地址、Google Maps
链接全部逐字来自 `印尼.md`。原文没写具体时间的两项（第 3、4 项）保留原文措辞
「出海关差不多中午」「吃完中饭后」，不补时间。原文没写的餐厅、景点、门票、天气、
行李清单一概不出现。`/source` 页把 11 条原文和页面内容并排列出，可直接核对。

派生信息只有五类，界面上都标了「推算」：当地时间换算、航段时长、中转空档、
每日所在地、机场搜索链接。

**2. Google 地图可跳转。** 四家酒店用的是 `印尼.md` 里的原始 Google Maps URL，
点「在 Google 地图打开」直接新标签页跳过去。机场原文只给了航站楼名称，用的是
按机场名生成的搜索链接，卡片上标注了「搜索链接」以示区分。

**3. 地图触发式渲染。** 打开页面不会向 Google 发任何请求 —— 已验证 `/places`
首屏 23 个请求全部指向 localhost，`document.querySelectorAll('iframe').length === 0`。
内嵌地图用 `v-if` 控制，点「载入地图预览」才创建 `<iframe>`；点「收起预览」会把
iframe 卸载掉释放连接。每张卡片的预览彼此独立。

## 结构

```
src/
  data/trip.ts       # 11 条行程数据，逐项标注 sourceIndex + sourceText
  types/trip.ts      # 数据模型与时区表
  utils/time.ts      # 北京时间 ↔ 当地时间换算、时长、倒计时
  stores/tripStore.ts# Pinia：用户备忘 + 显示偏好，存 localStorage
  components/
    MapLink.vue      # Google 地图跳转 + 按需 iframe
    SegmentCard.vue  # 单项行程卡
    TimeBadge.vue    # 双时区时间
  views/             # 总览 / 行程 / 当日 / 地点 / 备忘 / 原文
```

## 时区

原文注明「时间为北京时间」，所有数值按北京时间处理。

| 时区 | 偏移 | 地点 | 与北京 |
|---|---|---|---|
| WIB | UTC+7 | 泗水、布罗莫 | 晚 1 小时 |
| WITA | UTC+8 | 巴厘岛、科莫多 | 相同 |
| MYT | UTC+8 | 吉隆坡 | 相同 |

顶栏按钮可在「当地时间 / 北京时间」之间切换，选择存 localStorage。
两地同为 UTC+8 时不重复显示。
