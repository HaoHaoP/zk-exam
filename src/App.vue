<script setup>
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { masteryStats } from './lib/data'

const route = useRoute()
const tabs = [
  { name: 'home', label: '总览', to: '/' },
  { name: 'questions', label: '真题', to: '/questions' },
  { name: 'predict', label: '预测', to: '/predict' },
  { name: 'formulas', label: '公式', to: '/formulas' },
  { name: 'topics', label: '考点', to: '/topics' },
  { name: 'cards', label: '速记', to: '/cards' },
  { name: 'search', label: '搜索', to: '/search' },
]
</script>

<template>
  <div class="l-page">
    <header class="nav on-ink">
      <div class="nav__inner">
        <RouterLink to="/" class="nav__brand">
          大题精练
          <small>02325 · 04741</small>
        </RouterLink>
        <nav class="nav__tabs" aria-label="主导航">
          <RouterLink
            v-for="t in tabs" :key="t.name"
            :to="t.to" class="nav__tab"
            :class="{ 'is-active': route.name === t.name }"
          >{{ t.label }}</RouterLink>
        </nav>
      </div>
    </header>

    <main class="l-main">
      <RouterView />
    </main>

    <footer class="foot">
      <p>自考 02325《计算机系统结构》／04741《计算机网络原理》近三年大题精练。</p>
      <p>真题题干与参考答案来自历年真题 PDF；预测题为自拟模拟题，<strong>不是真题</strong>。</p>
      <p v-if="masteryStats.known + masteryStats.fuzzy + masteryStats.no > 0">
        已标记：熟 {{ masteryStats.known }} · 模糊 {{ masteryStats.fuzzy }} · 不会 {{ masteryStats.no }}
        （数据保存在本机浏览器，不上传）
      </p>
    </footer>
  </div>
</template>

<style scoped>
/* 手机端拆两行，避免标签被右边缘截断 */
.nav__inner {
  display: grid;
  gap: var(--s2);
  align-items: center;
}

.nav__brand {
  display: flex;
  align-items: baseline;
  gap: var(--s2);
}

.nav__brand small {
  display: inline;
  white-space: nowrap;
}

.nav__tabs {
  display: flex;
  gap: var(--s1);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  margin-left: 0;
}
.nav__tabs::-webkit-scrollbar { display: none; }

.nav__tab {
  flex: 1 1 0;
  text-align: center;
  padding: var(--s1) var(--s2);
}

@media (min-width: 560px) {
  .nav__inner {
    grid-template-columns: auto 1fr;
    gap: var(--s4);
  }
  .nav__brand { display: block; }
  .nav__tab { flex: none; padding: var(--s1) var(--s3); }
}
</style>
