<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QCard from '../components/QCard.vue'
import { predictSets, SUBJECTS } from '../lib/data'

const route = useRoute()
const router = useRouter()

const activeId = ref(route.query.set || predictSets[0].id)

watch(activeId, v => router.replace({ query: { set: v } }))

const sets = computed(() => predictSets)
const current = computed(() => sets.value.find(s => s.id === activeId.value) || sets.value[0])

const totalScore = computed(() => current.value.questions.reduce((n, q) => n + (q.score || 0), 0))
const subj = computed(() => SUBJECTS.find(s => s.code === current.value.id.slice(0, 5)))

const bySubject = computed(() => {
  const g = {}
  for (const s of sets.value) (g[s.id.slice(0, 5)] = g[s.id.slice(0, 5)] || []).push(s)
  return g
})
</script>

<template>
  <header class="phead volhead">
    <span class="t-eyebrow">模拟 · 非真题</span>
    <h1 class="t-title">预测题</h1>
    <p class="t-note">
      按近三年考频与轮考规律自拟，结构、题型、分值均照真题复刻。答案与评分要点为自拟，仅供参考，<strong>不可当作真题背诵</strong>。
    </p>
  </header>

  <p class="notice" style="margin-top: var(--s4)">
    这些题目是按「考过什么」推出来的，不是考试院出的卷子。用它练手、查漏，不要用它替代真题。
  </p>

  <template v-for="(group, code) in bySubject" :key="code">
    <div class="filters" style="margin-top: var(--s4)">
      <span class="t-eyebrow" style="align-self:center">{{ code }}</span>
      <button
        v-for="s in group" :key="s.id"
        class="chipbtn" :class="{ 'is-on': activeId === s.id }"
        @click="activeId = s.id"
      >{{ s.title }}</button>
    </div>
  </template>

  <section class="setcard paper">
    <div class="setcard__top">
      <div>
        <span class="t-eyebrow">{{ subj ? subj.name : '' }} · {{ current.id }}</span>
        <h2 class="t-head">{{ current.title }}</h2>
        <div class="setcard__meta t-mono">
          {{ current.questions.length }} 题 · 大题合计 {{ totalScore }} 分
        </div>
      </div>

      <div class="seal-round" aria-label="模拟卷 非真题">
        模拟卷
        <span class="seal-round__sub">非真题</span>
      </div>
    </div>

    <div class="basis">
      <span class="basis__k t-eyebrow">命题依据</span>
      <p>{{ current.basis }}</p>
    </div>
  </section>

  <div class="setlist">
    <QCard v-for="q in current.questions" :key="current.id + q.qnum" :item="{ ...q, code: current.id.slice(0, 5), period: current.id }" kind="预测" />
  </div>
</template>

<style scoped>
.phead .t-note { margin-top: var(--s3); max-width: 62ch; }

.setcard { margin-top: var(--s4); padding: var(--s4); }
.setcard__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--s3);
  flex-wrap: wrap;
}
.setcard__meta { font-size: var(--fs-xs); color: var(--pencil); }

.basis {
  margin-top: var(--s3);
  padding-top: var(--s3);
  border-top: 1px dashed var(--paper-3);
  font-size: var(--fs-sm);
  color: var(--ink-2);
  line-height: 1.8;
}
.basis__k { display: block; margin-bottom: var(--s1); }

.setlist { margin-top: var(--s4); display: grid; gap: var(--s3); }
</style>
