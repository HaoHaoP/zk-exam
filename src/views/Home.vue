<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  questions, fills, handouts, predictSets, topics, flatFormulas,
  SUBJECTS, periodLabel, masteryStats, resetMastery,
} from '../lib/data'

const paperStruct = {
  '02325': [
    { label: '单选', n: 10, score: 10 },
    { label: '填空', n: 10, score: 20 },
    { label: '简答', n: 5, score: 30 },
    { label: '简单应用', n: 2, score: 20 },
    { label: '综合应用', n: 2, score: 20 },
  ],
  '04741': [
    { label: '单选', n: 25, score: 25 },
    { label: '填空', n: 10, score: 10 },
    { label: '简答', n: 6, score: 30 },
    { label: '综合', n: 3, score: 35 },
  ],
}
const bigScore = { '02325': 70, '04741': 65 }

const byPeriod = computed(() => {
  const map = {}
  for (const q of questions) {
    map[q.period] = map[q.period] || {}
    map[q.period][q.code] = (map[q.period][q.code] || 0) + 1
  }
  return map
})

const near3 = topics.near3

const stats = computed(() => ({
  big: questions.length,
  fill: fills.length,
  handout: handouts.length,
  predict: predictSets.reduce((n, s) => n + s.questions.length, 0),
  formulas: flatFormulas().length,
  p02325: Object.keys(topics.heat['02325'] || {}).length,
  p04741: Object.keys(topics.heat['04741'] || {}).length,
}))

const marked = computed(() => masteryStats.value.known + masteryStats.value.fuzzy + masteryStats.value.no)

const isBig = (seg) => seg.label.includes('应用') || seg.label === '综合' || seg.label === '简答'
</script>

<template>
  <!-- 试卷封面式 hero：照真题卷面的排法复刻，左侧竖排密封线 -->
  <section class="cover paper">
    <span class="seal-vert" aria-hidden="true">密封线内不要答题</span>

    <div class="cover__inner">
      <div class="cover__confidential t-mono">绝密★启用前</div>

      <div class="cover__exam t-display">
        高等教育自学考试<br />全国统一命题考试
      </div>

      <h1 class="cover__title t-display">
        <span class="cover__subj">计算机系统结构</span>
        <span class="cover__subj">计算机网络原理</span>
      </h1>

      <div class="cover__codes t-display">（课程代码 02325 ／ 04741）</div>

      <hr class="cover__rule" />

      <p class="cover__lede">
        近三年 6 个考期的大题真题与参考答案，逐题校对、原卷可对。
      </p>
    </div>

    <div class="bars">
      <div v-for="s in SUBJECTS" :key="s.code" class="bars__item">
        <div class="bars__head">
          <span class="bars__code t-mono">{{ s.code }}</span>
          <span class="bars__name">{{ s.short }}</span>
          <span class="bars__sum t-mono">大题 {{ bigScore[s.code] }} 分</span>
        </div>
        <div class="bars__track" role="img"
             :aria-label="paperStruct[s.code].map(x => x.label + x.score + '分').join('、')">
          <span
            v-for="seg in paperStruct[s.code]" :key="seg.label"
            class="bars__seg" :class="{ 'bars__seg--big': isBig(seg) }"
            :style="{ flexGrow: seg.score }"
            :title="`${seg.label} ${seg.n}题 ${seg.score}分`"
          >{{ seg.score }}</span>
        </div>
        <div class="bars__legend t-mono">
          <span v-for="seg in paperStruct[s.code]" :key="seg.label">
            {{ seg.label }}{{ seg.n }}题/{{ seg.score }}分
          </span>
        </div>
      </div>
    </div>
  </section>

  <!-- 入口：一个主入口 + 三个紧凑格，避免四张同构卡片 -->
  <section class="entries">
    <RouterLink to="/questions" class="entry-main">
      <span class="entry-main__k t-eyebrow">真题大题</span>
      <span class="entry-main__n t-mono">{{ stats.big }}</span>
      <span class="entry-main__u">道</span>
      <span class="entry-main__d">近3年两科主观题 · 含参考答案与评分要点 · 原卷可对</span>
    </RouterLink>

    <div class="tiles">
      <RouterLink to="/predict" class="tile">
        <span class="tile__n t-mono">{{ stats.predict }}</span>
        <span class="tile__l">预测题 · {{ predictSets.length }} 套
          <span class="tile__hint">非真题</span>
        </span>
      </RouterLink>
      <RouterLink to="/formulas" class="tile">
        <span class="tile__n t-mono">{{ stats.formulas }}</span>
        <span class="tile__l">公式速查 · 含真题代入</span>
      </RouterLink>
      <RouterLink to="/topics" class="tile">
        <span class="tile__n t-mono">{{ stats.p02325 + stats.p04741 }}</span>
        <span class="tile__l">考期命中分布</span>
      </RouterLink>
      <RouterLink to="/cards" class="tile">
        <span class="tile__n t-mono">{{ stats.fill + stats.handout }}</span>
        <span class="tile__l">速记条目</span>
      </RouterLink>
    </div>
  </section>

  <section v-if="marked > 0" class="marked">
    <span class="t-eyebrow">本机进度</span>
    <p>
      已标记 熟 {{ masteryStats.known }} · 模糊 {{ masteryStats.fuzzy }} · 不会 {{ masteryStats.no }}
    </p>
    <RouterLink to="/questions?mastery=no" class="btn btn--ghost">只看「不会」的</RouterLink>
    <button class="btn btn--ghost" @click="resetMastery">清空标记</button>
  </section>

  <!-- 考期索引：一张答题卡式密表，比六张卡片更贴题 -->
  <section class="period-sec">
    <h2 class="t-head">考期索引</h2>
    <p class="t-note">
      6 个考期 × 2 科的题量。04741 的 2024年10月卷原卷组委会未收录题目文件，仅存参考答案。
    </p>

    <div class="ptable paper">
      <div class="ptable__row ptable__row--head">
        <span>考期</span>
        <span>02325 系统结构</span>
        <span>04741 网络原理</span>
      </div>
      <RouterLink
        v-for="p in near3" :key="p"
        :to="`/questions?period=${p}`"
        class="ptable__row"
      >
        <span class="ptable__p">
          <span class="ptable__y t-head">{{ periodLabel(p) }}</span>
          <span class="ptable__c t-mono">{{ p }}</span>
        </span>
        <span class="ptable__cell">
          <span class="tick" :class="{ 'tick--empty': !byPeriod[p]?.['02325'] }">
            {{ byPeriod[p]?.['02325'] ?? 0 }}
          </span>
          <span class="ptable__u t-mono">题</span>
        </span>
        <span class="ptable__cell">
          <span
            class="tick" :class="{ 'tick--empty': !byPeriod[p]?.['04741'], 'tick--red': p === '202410' }"
          >{{ (byPeriod[p]?.['04741'] ?? 0) }}</span>
          <span class="ptable__u t-mono">题</span>
        </span>
      </RouterLink>
    </div>

    <p class="t-note" style="margin-top: var(--s3)">
      <span class="tick tick--red" style="min-width:24px;height:20px;font-size:10px">9</span>
      红格 = 该卷仅有参考答案，题目原卷缺失（04741 · 2024年10月，9 道大题只提供答案）。
    </p>
  </section>
</template>

<style scoped>
/* ---------- 封面：复刻真题卷面 ---------- */
.cover {
  position: relative;
  padding-left: 30px;       /* 给竖排密封线留位 */
  border-top: 3px solid var(--ink);
}

.cover__inner {
  padding: var(--s5) var(--s4);
  text-align: center;
}

.cover__confidential {
  font-size: var(--fs-xs);
  letter-spacing: .3em;
  text-indent: .3em;
  color: var(--ink);
}

.cover__exam {
  margin-top: var(--s4);
  font-family: var(--font-display);
  font-size: var(--fs-md);
  font-weight: 700;
  line-height: 1.6;
  color: var(--ink-2);
}

.cover__title {
  margin-top: var(--s3);
  font-size: var(--fs-2xl);
  line-height: 1.3;
  display: flex;
  flex-direction: column;
  gap: var(--s1);
}
.cover__subj { display: block; }

.cover__codes {
  margin-top: var(--s3);
  font-size: var(--fs-sm);
  font-weight: 400;
  color: var(--ink-2);
}

.cover__rule {
  border: 0;
  border-top: 1px solid var(--ink);
  margin: var(--s4) 0 var(--s3);
}

.cover__lede {
  font-size: var(--fs-sm);
  color: var(--ink-2);
  max-width: 44ch;
  margin: 0 auto;
  line-height: 1.7;
}

/* ---------- 分值条 ---------- */
.bars { margin-top: var(--s5); display: grid; gap: var(--s4); }
.bars__head { display: flex; align-items: baseline; gap: var(--s2); font-size: var(--fs-sm); }
.bars__code { color: var(--indigo); font-weight: 700; }
.bars__name { font-weight: 700; }
.bars__sum  { margin-left: auto; font-size: var(--fs-xs); color: var(--pencil); }

.bars__track { display: flex; gap: 2px; margin-top: var(--s2); height: 28px; }

.bars__seg {
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: var(--fs-2xs);
  background: var(--paper-2); color: var(--ink-2);
  border: var(--line); border-radius: var(--r-xs);
}
.bars__seg--big { background: var(--ink); color: var(--paper); border-color: var(--ink); }

.bars__legend {
  display: flex; flex-wrap: wrap; gap: var(--s1) var(--s3);
  margin-top: var(--s2); font-size: var(--fs-2xs); color: var(--pencil);
}

/* ---------- 入口 ---------- */
.entries { margin-top: var(--s5); display: grid; gap: var(--s3); }

.entry-main {
  display: block;
  padding: var(--s4);
  background: var(--ink);
  color: var(--paper);
  border-radius: var(--r-md);
  text-decoration: none;
  transition: transform var(--dur-fast) var(--ease);
}
.entry-main:active { transform: translateY(1px); }
.entry-main__k { color: var(--pencil-2); }
.entry-main__n {
  font-size: 44px; font-weight: 700; line-height: 1;
  display: inline-block; margin-top: var(--s2);
}
.entry-main__u { font-size: var(--fs-md); margin-left: 2px; }
.entry-main__d { display: block; margin-top: var(--s2); font-size: var(--fs-sm); color: var(--pencil-2); }

.tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--s3); }

.tile {
  display: block;
  padding: var(--s3);
  background: #fff;
  border: var(--line);
  border-top: 3px solid var(--red);
  border-radius: var(--r-md);
  text-decoration: none;
  color: var(--ink);
  transition: transform var(--dur-fast) var(--ease);
}
.tile:active { transform: translateY(1px); }
.tile__n { display: block; font-size: var(--fs-xl); font-weight: 700; line-height: 1.1; }
.tile__l { display: block; margin-top: var(--s1); font-size: var(--fs-2xs); color: var(--pencil); line-height: 1.4; }
.tile__hint { display: block; color: var(--red); }

/* ---------- 进度 ---------- */
.marked {
  margin-top: var(--s5);
  padding: var(--s4);
  background: var(--paper-2);
  border: var(--line);
  border-radius: var(--r-md);
  display: flex; gap: var(--s3); align-items: center; flex-wrap: wrap;
  font-size: var(--fs-sm);
}

/* ---------- 考期密表 ---------- */
.period-sec { margin-top: var(--s6); }
.period-sec .t-note { margin-top: var(--s2); max-width: 56ch; }

.ptable { margin-top: var(--s4); overflow: hidden; }

.ptable__row {
  display: grid;
  grid-template-columns: minmax(96px, 1.3fr) 1fr 1fr;
  align-items: center;
  gap: var(--s2);
  padding: var(--s3) var(--s4);
  border-bottom: var(--line);
  color: var(--ink);
  text-decoration: none;
}
.ptable__row:last-child { border-bottom: 0; }
a.ptable__row:hover { background: var(--paper-2); }

.ptable__row--head {
  background: var(--ink);
  color: var(--paper);
  font-family: var(--font-mono);
  font-size: var(--fs-2xs);
  letter-spacing: .04em;
}

.ptable__p { display: flex; flex-direction: column; }
.ptable__y { font-size: var(--fs-md); }
.ptable__c { font-size: var(--fs-2xs); color: var(--pencil); }

.ptable__cell { display: flex; align-items: center; gap: var(--s2); }
.ptable__u { font-size: var(--fs-2xs); color: var(--pencil); }

@media (min-width: 640px) {
  .entries { grid-template-columns: 1.1fr 1fr; align-items: stretch; }
  .tiles { grid-template-columns: 1fr; }
  .cover__br { display: inline; }
  .bars { grid-template-columns: 1fr 1fr; gap: var(--s5); }
  .cover__title { font-size: var(--fs-3xl); }
}
</style>
