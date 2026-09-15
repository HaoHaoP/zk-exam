import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('./views/Home.vue'), meta: { title: '总览' } },
  { path: '/questions', name: 'questions', component: () => import('./views/Questions.vue'), meta: { title: '真题大题' } },
  { path: '/predict', name: 'predict', component: () => import('./views/Predict.vue'), meta: { title: '预测题' } },
  { path: '/topics', name: 'topics', component: () => import('./views/Topics.vue'), meta: { title: '考点地图' } },
  { path: '/cards', name: 'cards', component: () => import('./views/Cards.vue'), meta: { title: '考点速记' } },
  { path: '/search', name: 'search', component: () => import('./views/Search.vue'), meta: { title: '搜索' } },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.afterEach((to) => {
  document.title = (to.meta.title ? to.meta.title + ' · ' : '') + '自考大题精练'
})
