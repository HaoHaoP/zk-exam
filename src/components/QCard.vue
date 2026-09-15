<script setup>
import { ref, computed } from 'vue'
import {
  renderRich, moduleColor, masteryKey, getMastery, setMastery, MASTERY_STATES,
  paperUrl, hasPaper,
} from '../lib/data'

const props = defineProps({
  item: { type: Object, required: true },
  // '真题' | '预测' | '填空' | '背诵'
  kind: { type: String, default: '真题' },
})

const open = ref(false)

const noLabel = computed(() => props.item.qnum ?? null)
const mkey = computed(() => masteryKey(props.item.code, props.item.period, props.item.qnum))
const state = computed(() => getMastery(mkey.value))

const paper = computed(() => {
  if (props.kind !== '真题') return null
  if (!hasPaper(props.item.code, props.item.period, '题目')) return null
  return paperUrl(props.item.code, props.item.period, '题目')
})
const answerPaper = computed(() => {
  if (props.kind !== '真题') return null
  if (!hasPaper(props.item.code, props.item.period, '参考答案')) return null
  return paperUrl(props.item.code, props.item.period, '参考答案')
})

function toggle() { open.value = !open.value }
function rate(k) { setMastery(mkey.value, k) }
</script>

<template>
  <article class="qcard paper" :class="{ 'qcard--open': open }">
    <!-- 题头：照搬试卷格式 -->
    <div class="qcard__head qhead">
      <span v-if="noLabel" class="qhead__no">{{ noLabel }}</span>
      <span class="qhead__type">{{ item.qtype }}</span>
      <span class="qhead__sep">·</span>
      <span>{{ item.score }}分</span>
      <template v-if="kind === '真题'">
        <span class="qhead__sep">·</span>
        <span>{{ item.code }}-{{ item.period }}</span>
      </template>
      <template v-else-if="kind === '预测'">
        <span class="qhead__sep">·</span>
        <span class="t-red">预测</span>
      </template>
    </div>

    <div class="qcard__body">
      <div class="qcard__stem stem" v-html="renderRich(item.stem || '（本题题干缺失）')"></div>

      <p v-if="!item.stem" class="t-note" style="margin-top: var(--s2)">
        该考期题目原卷缺失（04741-202410 只有参考答案），此处仅提供答案。
      </p>

      <div v-if="item.modules && item.modules.length" class="qcard__mods l-row">
        <span
          v-for="m in item.modules" :key="m"
          class="chip" :style="{ color: moduleColor(item.code, m), borderColor: moduleColor(item.code, m) }"
        >{{ m }}</span>
      </div>

      <div class="qcard__acts l-row">
        <button class="btn btn--ghost" @click="toggle" :aria-expanded="open">
          {{ open ? '收起答案' : '显示参考答案' }}
        </button>
        <span class="t-note" v-if="kind === '真题' && paper">
          <a :href="paper" target="_blank" rel="noopener">看原卷</a>
        </span>
      </div>

      <div v-if="open" class="answer">
        <div class="answer__label">参考答案 · 评分要点</div>
        <div class="answer__body" v-html="renderRich(item.answer)"></div>
        <p v-if="answerPaper" class="t-note" style="margin-top: var(--s3)">
          来源：<a :href="answerPaper" target="_blank" rel="noopener">
            {{ item.code }}-{{ item.period }}-参考答案.pdf
          </a>
        </p>
      </div>

      <div class="qcard__rate">
        <span class="bubble-set__label">掌握度</span>
        <div class="bubble-set">
          <button
            v-for="s in MASTERY_STATES" :key="s.key"
            class="bubble" :data-state="s.key"
            :aria-pressed="state === s.key"
            :aria-label="s.label"
            @click="rate(s.key)"
          >
            <span class="bubble__box" :style="state === s.key ? 'box-shadow:0 0 0 2px var(--indigo)' : ''"></span>
            <span>{{ s.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.qcard {
  padding: 0;
  overflow: hidden;
}

.qcard__head {
  padding: var(--s3) var(--s4) 0;
  border-bottom: 0;
}

/* 题头下的油墨细线，像试卷题号与正文之间的分隔 */
.qcard__head::after {
  content: '';
  display: block;
  height: 1px;
  background: var(--ink);
  margin-top: var(--s2);
}

.qcard__body {
  padding: var(--s4);
}

.qcard__stem + .qcard__mods { margin-top: var(--s3); }
.qcard__acts { margin-top: var(--s4); justify-content: space-between; }

.qcard__rate {
  margin-top: var(--s4);
  padding-top: var(--s3);
  border-top: 1px dashed var(--paper-3);
  display: flex;
  align-items: center;
  gap: var(--s3);
  flex-wrap: wrap;
}
</style>
