<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { topics, SUBJECTS, periodLabel, MODULES, moduleColor } from '../lib/data'

const code = ref('02325')
const open = ref(null)

const pres = computed(() => topics.presence[code.value])
const near = computed(() => topics.near3)
const heat = computed(() => topics.heat[code.value] || {})
const heatPeriods = computed(() => Object.keys(heat.value).sort((a, b) => b.localeCompare(a)))
const topicIndex = computed(() => topics.topics[code.value] || {})

const maxPres = computed(() =>
  Math.max(1, ...Object.values(pres.value.matrix).flatMap(r => Object.values(r)))
)

const maxHeat = computed(() => 100)

function presStyle(n) {
  if (!n) return { background: 'var(--paper-2)', color: 'var(--pencil-2)' }
  const a = 0.12 + 0.78 * (n / maxPres.value)
  return {
    background: `rgba(20, 28, 38, ${a.toFixed(2)})`,
    color: a > 0.5 ? 'var(--paper)' : 'var(--ink)',
  }
}

function heatStyle(v) {
  if (!v) return { background: 'var(--paper-2)', color: 'var(--pencil-2)' }
  const a = 0.10 + 0.75 * (v / maxHeat.value)
  return {
    background: `rgba(200, 52, 43, ${a.toFixed(2)})`,
    color: a > 0.5 ? '#fff' : 'var(--ink)',
  }
}

function total(codeKey, m) {
  const r = topics.presence[codeKey].matrix[m]
  return Object.values(r).reduce((a, b) => a + b, 0)
}

const ranked = computed(() =>
  [...pres.value.modules].sort((a, b) => total(code.value, b) - total(code.value, a))
)
</script>

<template>
  <header class="phead volhead">
    <span class="t-eyebrow">考点 · 考频</span>
    <h1 class="t-title">考点地图</h1>
    <p class="t-note">
      左边是近三年 6 个考期里「该考点真的出过几道大题」（精确，来自逐题标注）；
      下面是全部可统计考期的关键词热度（近似，用来找轮考规律）。
    </p>
  </header>

  <div class="filters" style="margin-top: var(--s4)">
    <button
      v-for="s in SUBJECTS" :key="s.code"
      class="chipbtn" :class="{ 'is-on': code === s.code }"
      @click="code = s.code; open = null"
    >{{ s.code }} {{ s.short }}</button>
  </div>

  <!-- 近三年精确考频：涂卡式矩阵 -->
  <section class="block">
    <h2 class="t-head">近三年考点命中（单位：道大题）</h2>
    <div class="scroll">
      <div class="heat matrix" :style="{ gridTemplateColumns: `minmax(96px, 1.4fr) repeat(${near.length}, minmax(44px, 1fr)) 44px` }">
        <span class="heat__collabel"></span>
        <span v-for="p in near" :key="p" class="heat__collabel">{{ periodLabel(p) }}</span>
        <span class="heat__collabel">合计</span>

        <template v-for="m in ranked" :key="m">
          <span class="heat__rowlabel" :style="{ color: moduleColor(code, m) }">{{ m }}</span>
          <button
            v-for="p in near" :key="m + p"
            class="heat__cell cellbtn"
            :style="presStyle(pres.matrix[m][p])"
            :title="`${m} · ${periodLabel(p)}：${pres.matrix[m][p]} 道`"
            @click="open = (open === m ? null : m)"
          >{{ pres.matrix[m][p] || '' }}</button>
          <span class="heat__cell heat__total t-mono">{{ total(code, m) }}</span>
        </template>
      </div>
    </div>
    <p class="t-note" style="margin-top: var(--s2)">点任意格子可展开该考点的题目索引。</p>

    <div v-if="open" class="idx paper">
      <div class="idx__head">
        <span class="idx__title" :style="{ color: moduleColor(code, open) }">{{ open }}</span>
        <button class="chipbtn" @click="open = null">收起</button>
      </div>
      <ul class="idx__list">
        <li v-for="(t, i) in topicIndex[open] || []" :key="i">
          <RouterLink :to="`/questions?code=${code}&period=${t.period}&qtype=${encodeURIComponent(t.qtype)}&module=${encodeURIComponent(open)}`">
            {{ periodLabel(t.period) }} · 第{{ t.qnum }}题 · {{ t.qtype }} {{ t.score }}分
          </RouterLink>
        </li>
      </ul>
    </div>
  </section>

  <!-- 全部考期热度 -->
  <section class="block">
    <h2 class="t-head">全考期考点热度（{{ Object.keys(heat).length }} 个考期）</h2>
    <p class="t-note">
      取值 = 该考期参考答案里该考点关键词出现次数，按全表最大值归一到 100。
      数值越高，说明这一卷里与该考点相关的内容占比越大。这只是关键词统计，用于看趋势，不是逐年精确题数。
    </p>
    <div class="scroll">
      <div class="heat matrix" :style="{ gridTemplateColumns: `minmax(96px, 1.4fr) repeat(${heatPeriods.length}, minmax(40px, 1fr))` }">
        <span class="heat__collabel"></span>
        <span v-for="p in heatPeriods" :key="p" class="heat__collabel">{{ p.slice(2) }}</span>
        <template v-for="m in MODULES[code]" :key="'h' + m">
          <span class="heat__rowlabel" :style="{ color: moduleColor(code, m) }">{{ m }}</span>
          <span
            v-for="p in heatPeriods" :key="m + p"
            class="heat__cell"
            :style="heatStyle(heat[p]?.[m] || 0)"
            :title="`${m} · ${periodLabel(p)}：热度 ${heat[p]?.[m] || 0}`"
          >{{ (heat[p]?.[m] || 0) >= 40 ? (heat[p]?.[m]) : '' }}</span>
        </template>
      </div>
    </div>
    <p class="t-note" style="margin-top: var(--s2)">
      只显示 ≥40 的数值，其余用底色深浅表示。
      02325 可用 {{ Object.keys(topics.heat['02325'] || {}).length }} 个考期（2017–2019 部分考期参考答案为纯扫描件，未纳入）。
    </p>
  </section>
</template>

<style scoped>
.phead .t-note { margin-top: var(--s3); max-width: 64ch; }

.block { margin-top: var(--s6); }
.block .t-head { font-size: var(--fs-lg); margin-bottom: var(--s2); }
.block .t-note { margin-top: var(--s2); max-width: 64ch; }

.scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: var(--s3) 0;
}

.matrix { align-items: center; min-width: max-content; }

.cellbtn {
  border: 0;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: var(--fs-2xs);
  padding: var(--s2) 2px;
  min-height: 30px;
}
.cellbtn:hover { outline: 2px solid var(--indigo); outline-offset: -1px; }

.heat__total { font-weight: 700; background: #fff; border: var(--line); }

.idx { margin-top: var(--s4); padding: var(--s4); }
.idx__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  padding-bottom: var(--s2);
  border-bottom: 1px solid var(--ink);
}
.idx__title { font-family: var(--font-display); font-size: var(--fs-lg); font-weight: 700; }
.idx__list { margin-top: var(--s3); list-style: none; padding: 0; display: grid; gap: var(--s2); }
.idx__list a { font-size: var(--fs-sm); font-family: var(--font-mono); text-decoration: none; }
.idx__list a:hover { text-decoration: underline; }
</style>
