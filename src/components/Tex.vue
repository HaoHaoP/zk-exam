<script setup>
import { computed } from 'vue'
import katex from 'katex'

const props = defineProps({
  /** LaTeX 源码（不含 $ 定界符） */
  tex: { type: String, required: true },
  /** 渲染模式：inline(行内) | display(独立公式) */
  display: { type: Boolean, default: false },
})

/* KaTeX 的 throwOnError:false 会把错误渲成红色文字，但那很难看且会被忽略。
   这里显式捕获：失败时退回等宽原文，并给出可见提示，绝不让页面崩掉。 */
const out = computed(() => {
  try {
    const html = katex.renderToString(props.tex, {
      displayMode: props.display,
      throwOnError: true,
      strict: 'ignore',
      trust: false,
      output: 'html',
    })
    return { ok: true, html }
  } catch (e) {
    return { ok: false, html: '', err: e.message }
  }
})
</script>

<template>
  <span v-if="out.ok" class="ktx" :class="{ 'ktx--block': display }" v-html="out.html"></span>
  <code v-else class="ktx-fallback" :title="'LaTeX 渲染失败：' + out.err">{{ tex }}</code>
</template>

<style scoped>
.ktx {
  display: inline-block;
  max-width: 100%;
}
.ktx--block {
  display: block;
  overflow-x: auto;
  overflow-y: hidden;
  padding: var(--s1) 0;
}

/* KaTeX 自带字号偏小，与正文协调一下 */
.ktx :deep(.katex) { font-size: 1.06em; }
.ktx--block :deep(.katex-display) { margin: 0; }

.ktx-fallback {
  font-family: var(--font-mono);
  font-size: var(--fs-sm);
  color: var(--red);
  word-break: break-all;
}
</style>
