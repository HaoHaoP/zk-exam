<script setup>
import { ref, computed } from 'vue'
import Lightbox from './Lightbox.vue'
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
const lb = ref(null)

const noLabel = computed(() => props.item.qnum ?? null)
const mkey = computed(() => masteryKey(props.item.code, props.item.period, props.item.qnum))
const state = computed(() => getMastery(mkey.value))

const ansFigs = computed(() => props.item.answerFigures || [])
const stemFigs = computed(() => props.item.stemFigures || [])

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
function showFig(f) { lb.value = f }
</script>

<template>
  <article class="qcard paper" :class="{ 'qcard--open': open }">
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
      <!-- 题干影像（扫描原题裁切，含图） -->
      <div v-if="stemFigs.length" class="figs figs--stem">
        <figure v-for="f in stemFigs" :key="f.file" class="fig">
          <button class="fig__btn" @click="showFig(f)" :aria-label="`查看${f.caption || '原题影像'}`">
            <img :src="`/figs/${f.file}`" :alt="f.caption || '原题影像'" loading="lazy" />
          </button>
          <figcaption class="fig__cap t-mono">
            {{ f.caption || '原题影像' }}
            <span class="fig__zoom">点击放大</span>
          </figcaption>
        </figure>
      </div>

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
        <span v-if="ansFigs.length" class="chip chip--red">含答案附图 {{ ansFigs.length }}</span>
        <span class="t-note" v-if="kind === '真题' && paper">
          <a :href="paper" target="_blank" rel="noopener">看原卷</a>
        </span>
      </div>

      <div v-if="open" class="answer">
        <div class="answer__label">参考答案 · 评分要点</div>
        <div class="answer__body" v-html="renderRich(item.answer)"></div>

        <div v-if="ansFigs.length" class="figs figs--ans">
          <figure v-for="f in ansFigs" :key="f.file" class="fig">
            <button class="fig__btn" @click="showFig(f)" :aria-label="`查看${f.caption}`">
              <img :src="`/figs/${f.file}`" :alt="f.caption" loading="lazy" />
            </button>
            <figcaption class="fig__cap t-mono">
              <span class="fig__tag">{{ f.caption }}</span>
              {{ f.desc }}
              <span class="fig__zoom">点击放大</span>
            </figcaption>
          </figure>
        </div>

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

    <Lightbox
      v-if="lb"
      :src="`/figs/${lb.file}`" :caption="lb.caption" :desc="lb.desc"
      @close="lb = null"
    />
  </article>
</template>

<style scoped>
.qcard { padding: 0; overflow: hidden; }

.qcard__head { padding: var(--s3) var(--s4) 0; border-bottom: 0; }
.qcard__head::after {
  content: '';
  display: block;
  height: 1px;
  background: var(--ink);
  margin-top: var(--s2);
}

.qcard__body { padding: var(--s4); }

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

/* --- 附图 --- */
.figs { display: grid; gap: var(--s3); }
.figs--stem { margin-bottom: var(--s4); }
.figs--ans {
  margin-top: var(--s4);
  padding-top: var(--s3);
  border-top: 1px dashed var(--red);
}

.fig { margin: 0; }

.fig__btn {
  display: block;
  width: 100%;
  padding: var(--s2);
  background: var(--paper-2);
  border: var(--line);
  border-radius: var(--r-sm);
  cursor: zoom-in;
}
.fig__btn:hover { background: #e9e9e3; }

.fig__btn img {
  width: 100%;
  height: auto;
  background: #fff;
}

.fig__cap {
  margin-top: var(--s1);
  font-size: var(--fs-2xs);
  color: var(--ink-2);
  display: flex;
  align-items: baseline;
  gap: var(--s2);
  flex-wrap: wrap;
}

.fig__tag {
  color: var(--red);
  font-weight: 700;
}

.fig__zoom { margin-left: auto; color: var(--indigo); white-space: nowrap; }

@media (min-width: 560px) {
  .figs--ans { grid-template-columns: 1fr 1fr; }
}
</style>
