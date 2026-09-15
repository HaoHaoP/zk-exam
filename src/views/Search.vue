<script setup>
import { computed, ref } from 'vue'
import { buildSearchIndex, periodLabel, renderRich, SUBJECTS, normForSearch } from '../lib/data'

const index = buildSearchIndex()
const q = ref('')
const kindFilter = ref('all')

const KINDS = ['all', '真题大题', '填空题', '简答背诵库', '预测题']

const results = computed(() => {
  const kw = normForSearch(q.value)
  if (kw.length < 1) return []
  const hit = index.filter(it => {
    if (kindFilter.value !== 'all' && it.kind !== kindFilter.value) return false
    return it.nText.includes(kw) || it.nAnswer.includes(kw)
  })
  // 题干命中优先于答案命中
  hit.sort((a, b) => {
    const as = a.nText.includes(kw) ? 0 : 1
    const bs = b.nText.includes(kw) ? 0 : 1
    return as - bs
  })
  return hit.slice(0, 80)
})

const opened = ref({})
function toggle(i) { opened.value = { ...opened.value, [i]: !opened.value[i] } }

const kindCounts = computed(() => {
  const c = {}
  for (const it of index) c[it.kind] = (c[it.kind] || 0) + 1
  return c
})

const subjName = (code) => SUBJECTS.find(s => s.code === code)?.short || code

function renderHtml(t) { return renderRich(t) }
</script>

<template>
  <header class="phead volhead">
    <span class="t-eyebrow">全文检索</span>
    <h1 class="t-title">搜索</h1>
    <p class="t-note">
      跨真题（题干与答案）、填空题、简答背诵库、预测题检索。输入关键词即可，中文按子串匹配。
    </p>
  </header>

  <input
    v-model="q"
    class="searchbox"
    type="search"
    autofocus
    placeholder="例如：拥塞控制 / 哈夫曼 / 子网掩码 / FORK"
  />

  <div class="filters" style="margin-top: var(--s3)">
    <button
      v-for="k in KINDS" :key="k"
      class="chipbtn" :class="{ 'is-on': kindFilter === k }"
      @click="kindFilter = k"
    >{{ k === 'all' ? '全部' : k }}<template v-if="kindCounts[k]"> {{ kindCounts[k] }}</template></button>
  </div>

  <p v-if="q.trim()" class="count t-mono">命中 {{ results.length }} 条<template v-if="results.length === 80">（仅显示前 80 条）</template></p>

  <div v-if="results.length" class="rlist">
    <article v-for="(r, i) in results" :key="i" class="rcard paper">
      <div class="rcard__head">
        <span class="chip chip--indigo">{{ r.kind }}</span>
        <span class="t-mono rcard__meta">
          {{ r.code }} {{ subjName(r.code) }}
          <template v-if="r.period && r.period.length === 6"> · {{ periodLabel(r.period) }}</template>
          <template v-else-if="r.period"> · {{ r.period }}</template>
          <template v-if="r.qnum"> · 第{{ r.qnum }}题</template>
        </span>
        <button class="chipbtn" @click="toggle(i)">{{ opened[i] ? '藏答案' : '看答案' }}</button>
      </div>
      <div class="rcard__text">{{ r.text || '（题干缺失）' }}</div>
      <div v-if="opened[i]" class="rcard__ans" v-html="renderHtml(r.answer)"></div>
    </article>
  </div>

  <div v-else-if="q.trim()" class="empty">没找到。换个词试试，比如只输入两个字的术语。</div>
  <div v-else class="empty">
    输入关键词开始搜索。<br />
    当前索引：真题大题 {{ kindCounts['真题大题'] || 0 }} · 填空题 {{ kindCounts['填空题'] || 0 }} ·
    简答库 {{ kindCounts['简答背诵库'] || 0 }} · 预测题 {{ kindCounts['预测题'] || 0 }}
  </div>
</template>

<style scoped>
.phead .t-note { margin-top: var(--s3); max-width: 62ch; }

.searchbox {
  width: 100%;
  margin-top: var(--s4);
  padding: var(--s3);
  min-height: 46px;
  background: #fff;
  border: 2px solid var(--ink);
  border-radius: var(--r-sm);
  font: inherit;
  font-size: var(--fs-md);
  color: var(--ink);
}
.searchbox::placeholder { color: var(--pencil-2); }

.count {
  margin-top: var(--s4);
  padding-top: var(--s3);
  border-top: 1px solid var(--ink);
  font-size: var(--fs-sm);
}

.rlist { margin-top: var(--s3); display: grid; gap: var(--s3); }
.rcard { padding: var(--s3) var(--s4); }

.rcard__head {
  display: flex;
  align-items: center;
  gap: var(--s2);
  flex-wrap: wrap;
  padding-bottom: var(--s2);
  border-bottom: var(--line-dashed);
}
.rcard__meta { font-size: var(--fs-2xs); color: var(--pencil); }
.rcard__head .chipbtn { margin-left: auto; }

.rcard__text {
  margin-top: var(--s3);
  font-size: var(--fs-sm);
  line-height: 1.75;
  white-space: pre-wrap;
}

.rcard__ans {
  margin-top: var(--s3);
  padding-top: var(--s3);
  border-top: 2px solid var(--red);
  font-size: var(--fs-sm);
  line-height: var(--lh-loose);
  white-space: pre-wrap;
  color: var(--ink-2);
}
</style>
