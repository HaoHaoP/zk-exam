<script setup>
import { ref, watch, computed, onBeforeUnmount, onMounted, nextTick } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  caption: { type: String, default: '' },
  desc: { type: String, default: '' },
})

const emit = defineEmits(['close'])
const scale = ref(1)
const stage = ref(null)
const stageW = ref(0)
let ro = null

/* 关键：用真实宽度缩放，而不是 transform: scale()
   transform 不参与布局，放大后滚动条无法到达溢出部分，等于放大了个够不着的图。 */
const imgW = computed(() => {
  const base = stageW.value || 360
  return Math.round(base * scale.value) + 'px'
})

function measure() {
  if (stage.value) stageW.value = stage.value.clientWidth
}

function close() { emit('close') }
function zoom(d) { scale.value = Math.min(5, Math.max(1, +(scale.value + d).toFixed(2))) }
function reset() { scale.value = 1 }
function toggleZoom() { scale.value = scale.value > 1.2 ? 1 : 3 }

function onKey(e) {
  if (e.key === 'Escape') close()
  else if (e.key === '+' || e.key === '=') zoom(.5)
  else if (e.key === '-') zoom(-.5)
  else if (e.key === '0') reset()
}

function bind() {
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', measure)
  nextTick(measure)
}
function unbind() {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', measure)
  ro?.disconnect()
}

onMounted(() => {
  if (props.src) bind()
  if (stage.value && 'ResizeObserver' in window) {
    ro = new ResizeObserver(measure)
    ro.observe(stage.value)
  }
})

watch(() => props.src, (v) => {
  if (v) { scale.value = 1; bind() } else unbind()
})

onBeforeUnmount(unbind)
</script>

<template>
  <Teleport to="body">
    <div v-if="src" class="lb" role="dialog" aria-modal="true"
         :aria-label="caption || '查看图片'" @click.self="close">
      <div class="lb__bar">
        <span class="lb__cap t-mono">{{ caption }}</span>
        <span class="lb__tools">
          <button class="lb__btn" @click="zoom(-.5)" aria-label="缩小">−</button>
          <span class="t-mono lb__z">{{ Math.round(scale * 100) }}%</span>
          <button class="lb__btn" @click="zoom(.5)" aria-label="放大">＋</button>
          <button class="lb__btn" @click="reset" aria-label="适应宽度">适宽</button>
          <button class="lb__btn lb__btn--x" @click="close" aria-label="关闭">✕</button>
        </span>
      </div>

      <div ref="stage" class="lb__stage" @scroll="measure">
        <img
          :src="src" :alt="caption || desc"
          :style="{ width: imgW }"
          @dblclick="toggleZoom"
        />
      </div>

      <p class="lb__hint">
        {{ scale > 1.2 ? '拖动可平移图片' : '双击图片放大 · 或点右上角 ＋' }}
      </p>
      <p v-if="desc" class="lb__desc">{{ desc }}</p>
    </div>
  </Teleport>
</template>

<style scoped>
.lb {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(20, 28, 38, .96);
  display: flex;
  flex-direction: column;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.lb__bar {
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding: var(--s2) var(--s3);
  background: var(--ink);
  color: var(--paper);
  border-bottom: 1px solid #3d4753;
  flex: 0 0 auto;
}

.lb__cap {
  font-size: var(--fs-xs);
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lb__tools { margin-left: auto; display: flex; align-items: center; gap: var(--s1); }
.lb__z { font-size: var(--fs-2xs); color: #c3cbd6; min-width: 40px; text-align: center; }

.lb__btn {
  min-width: 36px;
  min-height: 36px;
  border: 1px solid #5a6675;
  border-radius: var(--r-sm);
  background: transparent;
  color: #fff;
  font-size: var(--fs-sm);
  line-height: 1;
  cursor: pointer;
}
.lb__btn:hover { background: #2b3440; }
.lb__btn--x { border-color: var(--red); color: #ffd9d6; }

/* 滚动容器：flex + 子元素 margin:auto 是「可滚动且居中」的可靠写法 */
.lb__stage {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  -webkit-overflow-scrolling: touch;
}

.lb__stage img {
  margin: auto;
  flex: 0 0 auto;
  width: auto;          /* 实际宽度由内联 style 按倍率给出 */
  max-width: none;      /* 必须覆盖 base.css 里 img{max-width:100%} 的全局重置，否则放大无效 */
  height: auto;
  background: #fff;
  display: block;
}

.lb__hint {
  flex: 0 0 auto;
  margin: 0;
  padding: var(--s2) var(--s4);
  text-align: center;
  font-size: var(--fs-xs);
  color: #c3cbd6;
}

.lb__desc {
  flex: 0 0 auto;
  margin: 0;
  padding: 0 var(--s4) var(--s4);
  color: #aab3bf;
  font-size: var(--fs-xs);
  text-align: center;
}
</style>
