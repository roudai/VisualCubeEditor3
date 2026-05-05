<template>
  <div>
    <div class="d-flex flex-wrap align-items-center gap-1 mb-2">
      <div class="d-flex gap-1">
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="adjust(-10)">−10</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="adjust(-1)">−1</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="adjust(1)">+1</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="adjust(10)">+10</button>
      </div>
      <span class="fw-bold">{{ store.imageSize }}px</span>
      <button type="button" class="btn btn-sm btn-outline-danger ms-auto" data-testid="reset-btn" @click="reset()">{{ t('reset') }}</button>
    </div>
    <input
      type="range"
      class="form-range"
      min="1"
      max="1000"
      v-model.number="store.imageSize"
    />
  </div>
</template>

<script setup lang="ts">
import { useRenderOptionsStore } from '../stores/renderOptions.js'
import { useLocaleStore } from '../stores/locale.js'

const store = useRenderOptionsStore()
const { t } = useLocaleStore()

function adjust(delta: number): void {
  store.imageSize = Math.max(1, store.imageSize + delta)
}

function reset(): void {
  store.imageSize = 128
}
</script>
