import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

/**
 * 用户自己录入的备忘 / 待办。
 * 应用不预置任何条目 —— 原始行程文件里没有的内容不凭空生成。
 */
export interface TodoItem {
  id: string
  text: string
  done: boolean
  /** 可挂到某一天（'YYYY-MM-DD'），也可以不挂（全程通用） */
  day: string | null
  createdAt: number
}

const TODO_KEY = 'indonesia-trip:todos'
const PREF_KEY = 'indonesia-trip:prefs'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export const useTripStore = defineStore('trip', () => {
  const todos = ref<TodoItem[]>(load<TodoItem[]>(TODO_KEY, []))

  const prefs = ref(
    load(PREF_KEY, {
      /** 时间显示：当地时间 / 北京时间 */
      clock: 'local' as 'local' | 'beijing',
      /** 是否允许加载 Google 地图内嵌视图（仅在用户点击后才真正加载） */
      allowMapEmbed: false,
    }),
  )

  watch(todos, (v) => localStorage.setItem(TODO_KEY, JSON.stringify(v)), { deep: true })
  watch(prefs, (v) => localStorage.setItem(PREF_KEY, JSON.stringify(v)), { deep: true })

  function addTodo(text: string, day: string | null = null) {
    const trimmed = text.trim()
    if (!trimmed) return
    todos.value.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: trimmed,
      done: false,
      day,
      createdAt: Date.now(),
    })
  }

  function toggleTodo(id: string) {
    const t = todos.value.find((x) => x.id === id)
    if (t) t.done = !t.done
  }

  function removeTodo(id: string) {
    todos.value = todos.value.filter((x) => x.id !== id)
  }

  function clearDone() {
    todos.value = todos.value.filter((x) => !x.done)
  }

  function todosForDay(day: string) {
    return todos.value.filter((t) => t.day === day)
  }

  const doneCount = computed(() => todos.value.filter((t) => t.done).length)

  function toggleClock() {
    prefs.value = { ...prefs.value, clock: prefs.value.clock === 'local' ? 'beijing' : 'local' }
  }

  function allowMapEmbed() {
    prefs.value = { ...prefs.value, allowMapEmbed: true }
  }

  return { todos, prefs, addTodo, toggleTodo, removeTodo, clearDone, todosForDay, doneCount, toggleClock, allowMapEmbed }
})
