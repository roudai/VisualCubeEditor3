<template>
  <div>
    <div class="d-flex align-items-center gap-1 mb-2">
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="adjust(-10)">−10</button>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="adjust(-1)">−1</button>
      <span class="mx-1 fw-bold">{{ store.imageSize }}px</span>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="adjust(1)">+1</button>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="adjust(10)">+10</button>
      <button type="button" class="btn btn-sm btn-outline-danger ms-auto" @click="reset()">Reset</button>
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

const store = useRenderOptionsStore()

function adjust(delta: number): void {
  store.imageSize = Math.max(1, store.imageSize + delta)
}

function reset(): void {
  store.imageSize = 128
}
</script>
