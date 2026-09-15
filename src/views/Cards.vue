<script setup>
import { computed, ref } from 'vue'
import {
  fills, handouts, SUBJECTS, periodLabel, MODULES, moduleColor, renderRich,
} from '../lib/data'

const tab = ref('fill')
const code = ref('02325')
const period = ref('all')
const q = ref('')

const fillList = computed(() =>
  fills
    .filter(f => f.code === code.value)
    .filter(f => period.value === 'all' || f.period === period.value)
    .filter(f => !q.value || (f.stem + f.answer).includes(q.value))
    .sort((a, b) => b.period.localeCompare(a.period) || a.qnum - b.qnum)
)

const periods = computed(() =>
  [...new Set(fills.filter(f => f.code === code.value).map(f => f.period))].sort((a, b) => b.localeCompare(a))
)

const handoutList = computed(() =>
  handouts
    .filter(h => h.code === code.value)
    .filter(h => !q.value || (h.q + h.a).includes(q.value))
)

const opened = ref({})
function toggleFill(key) { opened.value = { ...opened.value, [key]: !opened.value[key] } }
function showAll(v) {
  const m = {}
  for (const f of fillList.value) m[`${f.period}|${f.qnum}`] = v
  opened.value = m
}
</script>

<template>
  <header class="phead volhead">
    <span class="t-eyebrow">背诵 · 速记</span>
    <h1 class="t-title">考点速记</h1>
    <p class="t-note">
      填空题的答案是标准答案原文，用来自测「空里到底填什么」；简答背诵库来自你提供的资料，整段背。
    </p>
  </header>

  <div class="filters" style="margin-top: var(--s4)">
    <button class="chipbtn" :class="{ 'is-on': tab === 'fill' }" @click="tab = 'fill'">
      填空题速记 {{ fills.length }} 空
    </button>
    <button class="chipbtn" :class="{ 'is-on': tab === 'handout' }" @click="tab = 'handout'">
      简答背诵库 {{ handouts.length }} 条
    </button>
  </div>

  <div class="filters">
    <button
      v-for="s in SUBJECTS" :key="s.code"
      class="chipbtn" :class="{ 'is-on': code === s.code }"
      @click="code = s.code; period = 'all'"
    >{{ s.code }} {{ s.short }}</button>
  </div>

  <input v-model="q" class="searchbox" type="search" placeholder="在本页内筛选关键词…" />

  <template v-if="tab === 'fill'">
    <div class="filters">
      <button class="chipbtn" :class="{ 'is-on': period === 'all' }" @click="period = 'all'">全部考期</button>
      <button
        v-for="p in periods" :key="p"
        class="chipbtn" :class="{ 'is-on': period === p }"
        @click="period = p"
      >{{ periodLabel(p) }}</button>
    </div>

    <div class="l-row" style="margin-top: var(--s3)">
      <button class="chipbtn" @click="showAll(true)">全部显答案</button>
      <button class="chipbtn" @click="showAll(false)">全部收答案</button>
      <span class="t-mono t-muted" style="font-size:var(--fs-xs)">{{ fillList.length }} 空</span>
    </div>

    <div class="filllist">
      <div v-for="f in fillList" :key="f.period + f.qnum" class="fcard paper">
        <div class="fcard__head">
          <span class="t-mono fcard__no">{{ f.qnum }}</span>
          <span class="t-mono fcard__meta">{{ f.code }} · {{ periodLabel(f.period) }}</span>
          <button class="chipbtn" @click="toggleFill(`${f.period}|${f.qnum}`)">
            {{ opened[`${f.period}|${f.qnum}`] ? '藏答案' : '看答案' }}
          </button>
        </div>
        <div class="fcard__stem" v-html="renderRich(f.stem || '（题干缺失）')"></div>
        <div v-if="opened[`${f.period}|${f.qnum}`]" class="fcard__ans">
          <span class="answer__label">答案</span>
          <span class="fcard__ansval">{{ f.answer }}</span>
        </div>
        <div v-if="f.modules && f.modules.length" class="l-row" style="margin-top: var(--s2)">
          <span
            v-for="m in f.modules" :key="m" class="chip"
            :style="{ color: moduleColor(f.code, m), borderColor: moduleColor(f.code, m) }"
          >{{ m }}</span>
        </div>
      </div>
    </div>
  </template>

  <template v-else>
    <div class="filllist">
      <details v-for="(h, i) in handoutList" :key="i" class="hcard paper">
        <summary class="hcard__sum">
          <span class="t-mono hcard__no">{{ i + 1 }}</span>
          <span class="hcard__q">{{ h.q }}</span>
        </summary>
        <div class="hcard__a" v-html="renderRich(h.a)"></div>
        <p class="t-note">来源：{{ h.source }}</p>
      </details>
      <div v-if="!handoutList.length" class="empty">没有命中。</div>
    </div>
  </template>
</template>

<style scoped>
.phead .t-note { margin-top: var(--s3); max-width: 62ch; }

.searchbox {
  width: 100%;
  margin-top: var(--s3);
  padding: var(--s3);
  min-height: 42px;
  background: var(--paper-2);
  border: var(--line);
  border-radius: var(--r-sm);
  font: inherit;
  font-size: var(--fs-sm);
  color: var(--ink);
}
.searchbox::placeholder { color: var(--pencil-2); }

.filllist { margin-top: var(--s4); display: grid; gap: var(--s3); }

/* --- 填空卡 --- */
.fcard { padding: var(--s3) var(--s4) var(--s4); }

.fcard__head {
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding-bottom: var(--s2);
  border-bottom: 1px solid var(--ink);
  font-size: var(--fs-xs);
}
.fcard__no { font-weight: 700; font-family: var(--font-display); font-size: var(--fs-lg); }
.fcard__meta { color: var(--pencil); }
.fcard__head .chipbtn { margin-left: auto; }

.fcard__stem {
  margin-top: var(--s3);
  font-size: var(--fs-sm);
  line-height: var(--lh-loose);
  white-space: pre-wrap;
}

.fcard__ans {
  margin-top: var(--s3);
  padding-top: var(--s2);
  border-top: 2px solid var(--red);
  display: flex;
  gap: var(--s2);
  align-items: baseline;
  flex-wrap: wrap;
}
.fcard__ansval {
  font-size: var(--fs-md);
  font-weight: 700;
  color: var(--red);
}

/* --- 简答卡 --- */
.hcard { padding: var(--s3) var(--s4); }
.hcard__sum {
  display: flex;
  gap: var(--s2);
  cursor: pointer;
  list-style: none;
  align-items: baseline;
}
.hcard__sum::-webkit-details-marker { display: none; }
.hcard__sum::after {
  content: '展开';
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: var(--fs-2xs);
  color: var(--indigo);
  white-space: nowrap;
}
details[open] .hcard__sum::after { content: '收起'; }

.hcard__no { font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--pencil); }
.hcard__q { font-size: var(--fs-sm); font-weight: 700; line-height: 1.6; }

.hcard__a {
  margin-top: var(--s3);
  padding-top: var(--s3);
  border-top: 2px solid var(--red);
  font-size: var(--fs-sm);
  line-height: var(--lh-loose);
  white-space: pre-wrap;
  color: var(--ink-2);
}
</style>
