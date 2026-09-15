/* ============================================================
   数据访问与共享逻辑
   ============================================================ */
import { ref, computed } from 'vue'
import questionsRaw from '../data/questions.json'
import fillRaw from '../data/fill.json'
import topicsRaw from '../data/topics.json'
import handoutRaw from '../data/handout_qa.json'
import predict02325 from '../data/predict_02325.json'
import predict04741 from '../data/predict_04741.json'

export const questions = questionsRaw
export const fills = fillRaw
export const topics = topicsRaw
export const handouts = handoutRaw
export const predictSets = [...predict02325.sets, ...predict04741.sets]
export const predictMeta = {
  '02325': { disclaimers: predict02325.disclaimer, subject_name: predict02325.subject_name },
  '04741': { disclaimers: predict04741.disclaimer, subject_name: predict04741.subject_name },
}

export const SUBJECTS = [
  { code: '02325', name: '计算机系统结构', short: '系统结构', qtypeFlow: '简答5 · 简单应用2 · 综合应用2' },
  { code: '04741', name: '计算机网络原理', short: '网络原理', qtypeFlow: '简答6 · 综合3' },
]

/* ---------- 考期标签 ---------- */
export function periodLabel(p) {
  const y = p.slice(0, 4)
  const m = p.slice(4, 6)
  return `${y}年${Number(m)}月`
}

export function periodSort(a, b) { return b.localeCompare(a) }

export const ALL_PERIODS = [...new Set(questions.map(q => q.period))].sort(periodSort)

export function periodsOf(code) {
  return [...new Set(questions.filter(q => q.code === code).map(q => q.period))].sort(periodSort)
}

/* ---------- 考点模块 ---------- */
export const MODULES = {
  '02325': ['系统结构基本概念与指令系统', '存储系统', '流水线', '向量与阵列处理机', '互连网络', '并行处理与多处理机', '中断与I/O系统'],
  '04741': ['物理层与数据通信基础', '数据链路层', '网络层', '传输层', '应用层', '网络安全', '无线与移动网络'],
}
export const MODULE_COLOR_VARS = ['--m1', '--m2', '--m3', '--m4', '--m5', '--m6', '--m7']

export function moduleColor(code, mod) {
  const i = (MODULES[code] || []).indexOf(mod)
  return `var(${MODULE_COLOR_VARS[i >= 0 ? i % 7 : 6]})`
}

/* ---------- 文本渲染：转义 + 轻量数学记号还原 + markdown 表格 + 保留换行 ---------- */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/* 视觉转录保留了少量 LaTeX 记号，这里只做无损的符号替换，不重排公式结构 */
const MATH_MAP = [
  [/\\sum_\{([^}]*)\}\^\{([^}]*)\}/g, 'Σ($1→$2)'],
  [/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)'],
  [/\\begin\{cases\}/g, ''], [/\\end\{cases\}/g, ''],
  [/\\bmod/g, ' mod '],
  [/\\cdots/g, '…'], [/\\ldots/g, '…'], [/\\dots/g, '…'],
  [/\\cdot/g, '·'], [/\\times/g, '×'], [/\\div/g, '÷'],
  [/\\quad/g, ' '], [/\\qquad/g, ' '], [/\\,/g, ' '],
  [/\\leq/g, '≤'], [/\\geq/g, '≥'], [/\\neq/g, '≠'],
  [/\\pm/g, '±'], [/\\mp/g, '∓'],
  [/\\Delta/g, 'Δ'], [/\\delta/g, 'δ'], [/\\lambda/g, 'λ'], [/\\mu/g, 'μ'],
  [/\\alpha/g, 'α'], [/\\beta/g, 'β'], [/\\eta/g, 'η'], [/\\pi/g, 'π'],
  [/\\times10\^\{([^}]*)\}/g, '×10^$1'],
  [/\\to/g, '→'], [/\\rightarrow/g, '→'],
  [/\\text\{([^}]*)\}/g, '$1'],
  [/\\\{/g, '{'], [/\\\}/g, '}'],
  [/\$/g, ''],
]

export function tidyMath(s) {
  if (!s) return s
  let out = String(s)
  for (const [re, to] of MATH_MAP) out = out.replace(re, to)
  return out
}

/* 检索用归一：去掉所有空白，避免 PDF 抽取的换行把词切断 */
export function normForSearch(s) {
  return String(s || '').replace(/\s+/g, '').toLowerCase()
}

export function renderRich(text) {
  if (!text) return ''
  const lines = esc(tidyMath(text)).split('\n')
  const out = []
  let table = null

  const flush = () => {
    if (!table) return
    const rows = table.rows.filter(r => !/^\s*\|?[\s:|-]+\|?\s*$/.test(r))
    if (rows.length) {
      const cells = rows.map(r =>
        r.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(c => c.trim())
      )
      const head = cells[0]
      out.push('<table class="md-table"><thead><tr>' +
        head.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>' +
        cells.slice(1).map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') +
        '</tbody></table>')
    }
    table = null
  }

  for (const ln of lines) {
    if (ln.trim().startsWith('|')) {
      if (!table) table = { rows: [] }
      table.rows.push(ln)
      continue
    }
    flush()
    // 连续下划线（填空题空位）转成可见的填空线
    out.push(ln.replace(/_{3,}/g, '<span class="blank">＿</span>'))
  }
  flush()
  return out.join('\n')
}

/* ---------- 掌握度自评（localStorage） ---------- */
const LS_KEY = 'zk-exam:mastery:v1'
const mastery = ref(loadMastery())

function loadMastery() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}')
  } catch { return {} }
}

function persist() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(mastery.value)) } catch {}
}

export function masteryKey(code, period, qnum) {
  return `${code}|${period}|${qnum}`
}

export function getMastery(key) {
  return mastery.value[key] || null
}

export function setMastery(key, state) {
  const next = { ...mastery.value }
  if (!state || next[key] === state) delete next[key]
  else next[key] = state
  mastery.value = next
  persist()
}

export const masteryStats = computed(() => {
  const s = { known: 0, fuzzy: 0, no: 0 }
  for (const v of Object.values(mastery.value)) if (s[v] !== undefined) s[v]++
  return s
})

export function resetMastery() {
  mastery.value = {}
  persist()
}

export const MASTERY_STATES = [
  { key: 'known', label: '熟' },
  { key: 'fuzzy', label: '模糊' },
  { key: 'no', label: '不会' },
]

export { mastery }

/* ---------- 原卷 PDF 路径 ---------- */
export function paperUrl(code, period, kind) {
  const norm = kind === '试题' ? '题目' : kind
  return `/papers/${code}-${period}-${norm}.pdf`
}

export function hasPaper(code, period, kind) {
  if (code === '04741' && period === '202410' && (kind === '题目' || kind === '试题')) return false
  return true
}

/* ---------- 全局搜索 ---------- */
function withNorm(o) {
  o.nText = normForSearch(o.text)
  o.nAnswer = normForSearch(o.answer)
  return o
}

export function buildSearchIndex() {
  const idx = []
  for (const q of questions) {
    idx.push(withNorm({
      kind: '真题大题', code: q.code, period: q.period, qnum: q.qnum,
      type: q.qtype, text: q.stem, answer: q.answer, modules: q.modules,
    }))
  }
  for (const f of fills) {
    idx.push(withNorm({
      kind: '填空题', code: f.code, period: f.period, qnum: f.qnum,
      type: '填空题', text: f.stem, answer: f.answer, modules: f.modules,
    }))
  }
  for (const h of handouts) {
    idx.push(withNorm({
      kind: '简答背诵库', code: h.code, period: '', qnum: null,
      type: '简答', text: h.q, answer: h.a, modules: [],
    }))
  }
  for (const s of predictSets) {
    for (const q of s.questions) {
      idx.push(withNorm({
        kind: '预测题', code: s.id.startsWith('02325') ? '02325' : '04741',
        period: s.id, qnum: q.qnum, type: q.qtype,
        text: q.stem, answer: q.answer, modules: q.modules, setId: s.id, setTitle: s.title,
      }))
    }
  }
  return idx
}
