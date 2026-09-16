<script setup lang="ts">
/** 备忘全部由你自己写，应用不预置任何条目，存在本机浏览器里。 */
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { DAYS } from '@/data/trip'
import { prettyDate, weekdayOf } from '@/utils/time'
import { useTripStore } from '@/stores/tripStore'

const store = useTripStore()
const draft = ref('')
const targetDay = ref('')

function submit() {
  store.addTodo(draft.value, targetDay.value || null)
  draft.value = ''
}

const groups = computed(() => {
  const general = store.todos.filter((t) => !t.day)
  const byDay = DAYS.map((day) => ({ day, items: store.todos.filter((t) => t.day === day.date) })).filter(
    (g) => g.items.length,
  )
  return { general, byDay }
})
</script>

<template>
  <div>
    <header class="bleed head">
      <h1>还要记着的事</h1>
      <p class="lede">写什么都行，只存在这台设备的浏览器里，不会上传。</p>
    </header>

    <section class="bleed">
      <form class="comp" @submit.prevent="submit">
        <input v-model="draft" type="text" placeholder="比如：确认布罗莫看日出要几点出发" />
        <select v-model="targetDay">
          <option value="">整趟都要记得</option>
          <option v-for="d in DAYS" :key="d.date" :value="d.date">
            {{ prettyDate(d.date) }} {{ weekdayOf(d.date) }}
          </option>
        </select>
        <button class="btn btn--sun" type="submit">记下</button>
      </form>

      <p v-if="store.todos.length" class="tally">
        {{ store.todos.length }} 条，做完 {{ store.doneCount }} 条
        <button class="tally__clr" @click="store.clearDone()">清掉做完的</button>
      </p>

      <section v-if="groups.general.length" class="grp">
        <h2 class="grp__h">整趟都要记得</h2>
        <ul class="lst">
          <li v-for="t in groups.general" :key="t.id" :class="{ done: t.done }">
            <input type="checkbox" :checked="t.done" @change="store.toggleTodo(t.id)" />
            <span>{{ t.text }}</span>
            <button class="lst__del" @click="store.removeTodo(t.id)">删掉</button>
          </li>
        </ul>
      </section>

      <section v-for="g in groups.byDay" :key="g.day.date" :class="['grp', 'tint', `tint--${g.day.chapter}`]">
        <h2 class="grp__h grp__h--day">
          <RouterLink :to="`/day/${g.day.date}`">{{ prettyDate(g.day.date) }}</RouterLink>
        </h2>
        <ul class="lst">
          <li v-for="t in g.items" :key="t.id" :class="{ done: t.done }">
            <input type="checkbox" :checked="t.done" @change="store.toggleTodo(t.id)" />
            <span>{{ t.text }}</span>
            <button class="lst__del" @click="store.removeTodo(t.id)">删掉</button>
          </li>
        </ul>
      </section>

      <p v-if="!store.todos.length" class="empty-note">还是空的。上面写一条试试。</p>
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

.comp {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 26px;
  max-width: 760px;
}
.comp input {
  flex: 1;
  min-width: 230px;
}

.tally {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 0 22px;
  font-size: 15px;
  color: var(--ink-2);
}
.tally__clr {
  border: 0;
  background: transparent;
  color: var(--ink-3);
  font-size: 14.5px;
  text-decoration: underline;
  text-underline-offset: 4px;
}
.tally__clr:hover {
  color: var(--sun);
}

.grp {
  margin-bottom: 30px;
  max-width: 760px;
}
.grp__h {
  font-size: 16px;
  color: var(--ink-2);
  margin-bottom: 8px;
  padding-left: 12px;
  border-left: 4px solid var(--c, var(--rule));
}
.grp__h--day a {
  color: var(--c);
}

.lst {
  list-style: none;
  margin: 0;
  padding: 0;
}
.lst li {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 13px 0;
  border-bottom: 1px solid var(--rule-soft);
  font-size: 16.5px;
}
.lst li.done span {
  text-decoration: line-through;
  color: var(--ink-3);
}
.lst li span {
  flex: 1;
}
.lst input {
  width: 18px;
  height: 18px;
  accent-color: var(--shallow);
}
.lst__del {
  border: 0;
  background: transparent;
  color: var(--ink-3);
  font-size: 14px;
}
.lst__del:hover {
  color: var(--sun);
}
</style>
