import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { title: '总览' } },
  {
    path: '/itinerary',
    name: 'itinerary',
    component: () => import('@/views/ItineraryView.vue'),
    meta: { title: '行程' },
  },
  {
    path: '/day/:date',
    name: 'day',
    component: () => import('@/views/DayView.vue'),
    props: true,
    meta: { title: '当日' },
  },
  { path: '/map', name: 'map', component: () => import('@/views/MapView.vue'), meta: { title: '地图' } },
  { path: '/places', name: 'places', component: () => import('@/views/PlacesView.vue'), meta: { title: '住处' } },
  { path: '/notes', name: 'notes', component: () => import('@/views/NotesView.vue'), meta: { title: '备忘' } },
  { path: '/source', name: 'source', component: () => import('@/views/SourceView.vue'), meta: { title: '原文' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, saved) {
    return saved ?? { top: 0 }
  },
})

router.afterEach((to) => {
  const t = to.meta.title as string | undefined
  document.title = t ? `${t} · 印尼行程` : '印尼行程'
})
