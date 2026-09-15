<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QCard from '../components/QCard.vue'
import {
  questions, SUBJECTS, periodsOf, periodLabel, MODULES,
  masteryKey, getMastery,
} from '../lib/data'

const route = useRoute()
const router = useRouter()

const code    = ref(route.query.code || '02325')
const period  = ref(route.query.period || 'all')
const qtype   = ref(route.query.qtype || 'all')
const module  = ref(route.query.module || 'all')
const mastery = ref(route.query.mastery || 'all')
const figonly = ref(route.query.fig === '1')

watch([code, period, qtype, module, mastery, figonly], () => {
  router.replace({
    query: {
      ...(code.value !== '02325' ? { code: code.value } : {}),
      ...(period.value !== 'all' ? { period: period.value } : {}),
      ...(qtype.value !== 'all' ? { qtype: qtype.value } : {}),
      ...(module.value !== 'all' ? { module: module.value } : {}),
      ...(mastery.value !== 'all' ? { mastery: mastery.value } : {}),
      ...(figonly.value ? { fig: '1' } : {}),
    },
  })
})

watch(code, () => {
  const ps = periodsOf(code.value)
  if (period.value !== 'all' && !ps.includes(period.value)) period.value = 'all'
  if (module.value !== 'all' && !MODULES[code.value].includes(module.value)) module.value = 'all'
})

const periods = computed(() => periodsOf(code.value))

const qtypes = computed(() =>
  [...new Set(questions.filter(q => q.code === code.value).map(q => q.qtype))]
)

const modules = computed(() => MODULES[code.value])

function hasFig(q) {
  return (q.answerFigures && q.answerFigures.length) || (q.stemFigures && q.stemFigures.length)
}

const figCount = computed(() =>
  questions.filter(q => q.code === code.value).filter(hasFig).length
)

const list = computed(() =>
  questions
    .filter(q => q.code === code.value)
    .filter(q => period.value === 'all' || q.period === period.value)
    .filter(q => qtype.value === 'all' || q.qtype === qtype.value)
    .filter(q => module.value === 'all' || (q.modules || []).includes(module.value))
    .filter(q => !figonly.value || hasFig(q))
    .filter(q => {
      if (mastery.value === 'all') return true
      const st = getMastery(masteryKey(q.code, q.period, q.qnum))
      if (mastery.value === 'unmarked') return !st
      return st === mastery.value
    })
    .sort((a, b) => b.period.localeCompare(a.period) || a.qnum - b.qnum)
)

const grouped = computed(() => {
  const g = {}
  for (const q of list.value) {
    ;(g[q.period] = g[q.period] || []).push(q)
  }
  return Object.keys(g).sort((a, b) => b.localeCompare(a)).map(k => ({ period: k, items: g[k] }))
})

function reset() {
  period.value = 'all'; qtype.value = 'all'; module.value = 'all'
  mastery.value = 'all'; figonly.value = false
}
const isFiltered = computed(() =>
  period.value !== 'all' || qtype.value !== 'all' || module.value !== 'all' ||
  mastery.value !== 'all' || figonly.value
)
</script>

<template>
  <header class="phead volhead">
    <span class="t-eyebrow">第二部分 · 非选择题</span>
    <h1 class="t-title">真题大题</h1>
    <p class="t-note">
      单选与填空题不进答题库（填空题另见「考点速记」）。每题标注来源，可跳转原卷 PDF 逐字核对。
      含图表的题已把原卷对应区域裁成「原题影像」，答案里的图也一并抽出（答案附图），
      图片可点开放大、双击切换倍率。
    </p>
  </header>

  <!-- 科目切换 -->
  <div class="filters" style="margin-top: var(--s5)">
    <button
      v-for="s in SUBJECTS" :key="s.code"
      class="chipbtn" :class="{ 'is-on': code === s.code }"
      @click="code = s.code"
    >{{ s.code }} {{ s.short }}</button>
  </div>

  <!-- 考期 -->
  <div class="filters">
    <button class="chipbtn" :class="{ 'is-on': period === 'all' }" @click="period = 'all'">全部考期</button>
    <button
      v-for="p in periods" :key="p"
      class="chipbtn" :class="{ 'is-on': period === p }"
      @click="period = p"
    >{{ periodLabel(p) }}</button>
  </div>

  <!-- 题型 -->
  <div class="filters">
    <button class="chipbtn" :class="{ 'is-on': qtype === 'all' }" @click="qtype = 'all'">全部题型</button>
    <button
      v-for="t in qtypes" :key="t"
      class="chipbtn" :class="{ 'is-on': qtype === t }"
      @click="qtype = t"
    >{{ t }}</button>
  </div>

  <!-- 考点模块 -->
  <div class="filters">
    <button class="chipbtn" :class="{ 'is-on': module === 'all' }" @click="module = 'all'">全部考点</button>
    <button
      v-for="m in modules" :key="m"
      class="chipbtn" :class="{ 'is-on': module === m }"
      @click="module = m"
    >{{ m }}</button>
  </div>

  <!-- 含图筛选 -->
  <div class="filters">
    <button
      class="chipbtn" :class="{ 'is-on': figonly }"
      @click="figonly = !figonly"
    >只看含图的题（{{ figCount }}）</button>
  </div>

  <!-- 掌握度 -->
  <div class="filters">
    <span class="t-eyebrow" style="align-self:center">掌握度</span>
    <button class="chipbtn" :class="{ 'is-on': mastery === 'all' }" @click="mastery = 'all'">不限</button>
    <button class="chipbtn" :class="{ 'is-on': mastery === 'no' }" @click="mastery = 'no'">不会</button>
    <button class="chipbtn" :class="{ 'is-on': mastery === 'fuzzy' }" @click="mastery = 'fuzzy'">模糊</button>
    <button class="chipbtn" :class="{ 'is-on': mastery === 'known' }" @click="mastery = 'known'">熟</button>
    <button class="chipbtn" :class="{ 'is-on': mastery === 'unmarked' }" @click="mastery = 'unmarked'">未标记</button>
  </div>

  <div class="count l-row">
    <span class="t-mono">命中 {{ list.length }} 题</span>
    <button v-if="isFiltered" class="chipbtn" @click="reset">清除筛选</button>
  </div>

  <p v-if="code === '04741' && (period === '202410' || period === 'all')" class="notice">
    04741 的 2024年10月卷，原卷组委会未收录题目文件，仅有参考答案。该考期 9 道大题只提供答案，题干缺失已如实标注。
  </p>

  <div v-if="grouped.length" class="groups">
    <section v-for="g in grouped" :key="g.period" class="group">
      <div class="group__head seal">{{ periodLabel(g.period) }} · {{ g.items.length }} 题</div>
      <div class="group__list">
        <QCard v-for="q in g.items" :key="q.code + q.period + q.qnum" :item="q" kind="真题" />
      </div>
    </section>
  </div>

  <div v-else class="empty">
    没有命中的题目。换个筛选条件，或点「清除筛选」。
  </div>
</template>

<style scoped>
.phead { margin-bottom: var(--s2); }
.phead .t-note { margin-top: var(--s3); max-width: 60ch; }

.filters + .filters { margin-top: var(--s2); }

.count {
  margin-top: var(--s4);
  padding-top: var(--s3);
  border-top: 1px solid var(--ink);
  justify-content: space-between;
  font-size: var(--fs-sm);
}

.groups { margin-top: var(--s4); display: grid; gap: var(--s5); }
.group__head { margin-bottom: var(--s2); }
.group__list { display: grid; gap: var(--s3); }

.notice { margin-top: var(--s4); }
</style>
