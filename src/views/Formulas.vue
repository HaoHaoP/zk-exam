<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Lightbox from '../components/Lightbox.vue'
import { formulas, SUBJECTS } from '../lib/data'

const route = useRoute()
const router = useRouter()

const code = ref(route.query.code || '02325')
const openIds = ref(new Set())
const lb = ref(null)

watch(code, () => {
  openIds.value = new Set()
  router.replace({ query: { ...(code.value !== '02325' ? { code: code.value } : {}) } })
})

const groups = computed(() => formulas[code.value] || [])

const count = computed(() =>
  groups.value.reduce((n, g) => n + g.items.length, 0)
)

function isOpen(id) { return openIds.value.has(id) }
function toggle(id) {
  const s = new Set(openIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  openIds.value = s
}
function expandAll() {
  openIds.value = new Set(groups.value.flatMap(g => g.items.map(i => i.id)))
}
function collapseAll() { openIds.value = new Set() }

/* 「为什么长这样」里用了 **粗体** 强调，做个轻量渲染 */
function rich(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}
</script>

<template>
  <header class="phead volhead">
    <span class="t-eyebrow">第三部分 · 计算工具箱</span>
    <h1 class="t-title">常用公式速查</h1>
    <p class="t-note">
      只收近 3 年真题实际考过、以及教材必考的计算式。每条给四样东西：
      <b>公式本体</b> → <b>符号逐个说明</b> → <b>这个式子为什么长这样</b> → <b>真题原题数字代入</b>。
      实例都注明出处，可对照「真题大题」里的原题。
    </p>
  </header>

  <div class="filters" style="margin-top: var(--s5)">
    <button
      v-for="s in SUBJECTS" :key="s.code"
      class="chipbtn" :class="{ 'is-on': code === s.code }"
      @click="code = s.code"
    >{{ s.code }} {{ s.short }}</button>
  </div>

  <div class="count l-row">
    <span class="t-mono">共 {{ count }} 条公式 · {{ groups.length }} 个模块</span>
    <span class="l-row" style="gap: var(--s1)">
      <button class="chipbtn" @click="expandAll">全部展开</button>
      <button class="chipbtn" @click="collapseAll">全部收起</button>
    </span>
  </div>

  <div class="fgroups">
    <section v-for="g in groups" :key="g.group" class="fgroup">
      <div class="fgroup__head seal">{{ g.group }}</div>

      <div class="fgroup__list">
        <article
          v-for="it in g.items" :key="it.id"
          class="fcard paper" :class="{ 'fcard--open': isOpen(it.id) }"
        >
          <button class="fcard__head" :aria-expanded="isOpen(it.id)" @click="toggle(it.id)">
            <span class="fcard__name">{{ it.name }}</span>
            <span class="fcard__toggle t-mono">{{ isOpen(it.id) ? '收起' : '展开' }}</span>
          </button>

          <div class="fcard__formula fmla">{{ it.formula }}</div>
          <div v-if="it.alt" class="fcard__alt fmla">{{ it.alt }}</div>

          <div v-if="isOpen(it.id)" class="fcard__body">
            <!-- 符号说明 -->
            <div class="fsec">
              <div class="fsec__label">符号说明</div>
              <dl class="syms">
                <template v-for="s in it.symbols" :key="s[0]">
                  <dt class="fmla">{{ s[0] }}</dt>
                  <dd>{{ s[1] }}</dd>
                </template>
              </dl>
            </div>

            <!-- 为什么长这样 -->
            <div class="fsec">
              <div class="fsec__label">为什么长这样</div>
              <p class="fsec__text" v-html="rich(it.why)"></p>
            </div>

            <!-- 真题实例 -->
            <div class="fsec fsec--ex">
              <div class="fsec__label">
                真题实例代入
                <span class="fsec__src t-mono">{{ it.example.source }}</span>
              </div>
              <p class="fsec__sub">{{ it.example.setup }}</p>
              <pre class="calc fmla">{{ it.example.calc }}</pre>
            </div>

            <div v-if="it.units" class="fcard__units t-note">
              单位：{{ it.units }}
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>

  <p class="t-note" style="margin-top: var(--s5)">
    公式为考试口径整理；个别题目答案的取整/单位约定以原卷为准（已在实例中注明）。
    标注「教材通用题型」的条目表示近 3 年正库未直接考到，但属大纲必会。
  </p>
</template>

<style scoped>
.phead { margin-bottom: var(--s2); }
.phead .t-note { margin-top: var(--s3); max-width: 64ch; }

.filters + .filters { margin-top: var(--s2); }

.count {
  margin-top: var(--s4);
  padding-top: var(--s3);
  border-top: 1px solid var(--ink);
  justify-content: space-between;
  align-items: center;
  font-size: var(--fs-sm);
}

.fgroups { margin-top: var(--s4); display: grid; gap: var(--s5); }
.fgroup__head { margin-bottom: var(--s2); }
.fgroup__list { display: grid; gap: var(--s3); }

/* --- 公式卡 --- */
.fcard { padding: 0; overflow: hidden; }

.fcard__head {
  display: flex;
  align-items: center;
  gap: var(--s3);
  width: 100%;
  padding: var(--s3) var(--s4);
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--paper-3);
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
}
.fcard__head:hover { background: var(--paper-2); }

.fcard__name {
  font-family: var(--font-head);
  font-weight: 700;
  font-size: var(--fs-lg);
  color: var(--ink);
}
.fcard__toggle { margin-left: auto; color: var(--indigo); font-size: var(--fs-2xs); white-space: nowrap; }

.fcard__formula,
.fmla {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.fcard__formula {
  padding: var(--s3) var(--s4);
  font-size: var(--fs-sm);
  line-height: 1.7;
  color: var(--ink);
  background: var(--paper-2);
  border-bottom: 1px dashed var(--paper-3);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.fcard__alt {
  padding: var(--s2) var(--s4);
  font-size: var(--fs-2xs);
  color: var(--ink-2);
  background: var(--paper-2);
  border-bottom: 1px solid var(--paper-3);
  overflow-x: auto;
  white-space: pre-wrap;
}

.fcard__body { padding: var(--s4); }

.fsec + .fsec {
  margin-top: var(--s4);
  padding-top: var(--s3);
  border-top: 1px dashed var(--paper-3);
}

.fsec__label {
  display: flex;
  align-items: baseline;
  gap: var(--s2);
  flex-wrap: wrap;
  font-size: var(--fs-xs);
  font-weight: 700;
  letter-spacing: .04em;
  color: var(--indigo);
  margin-bottom: var(--s2);
}

.fsec__src {
  font-weight: 400;
  color: var(--red);
  font-size: var(--fs-2xs);
}

.fsec__text { margin: 0; font-size: var(--fs-sm); line-height: var(--lh-body); }
.fsec__sub { margin: 0 0 var(--s2); font-size: var(--fs-sm); color: var(--ink-2); }

/* 符号表：两列对齐 */
.syms {
  margin: 0;
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--s1) var(--s3);
  font-size: var(--fs-sm);
}
.syms dt {
  color: var(--red);
  font-weight: 700;
  white-space: nowrap;
}
.syms dd { margin: 0; color: var(--ink-2); }

.calc {
  margin: 0;
  padding: var(--s3);
  background: var(--paper-2);
  border: var(--line);
  border-left: 3px solid var(--red);
  border-radius: var(--r-sm);
  font-size: var(--fs-xs);
  line-height: 1.8;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.fcard__units { margin-top: var(--s3); }

@media (min-width: 700px) {
  .fgroup__list { grid-template-columns: 1fr 1fr; }
}
</style>
