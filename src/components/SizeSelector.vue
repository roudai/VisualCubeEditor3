<template>
  <div class="size-selector d-flex align-items-center gap-1">
    <button type="button" class="btn btn-sm btn-outline-secondary" :disabled="store.size <= 2" @click="decrement">−</button>
    <label for="cube-size" class="mb-0">サイズ:</label>
    <select id="cube-size" :value="store.size" @change="onSizeChange">
      <option v-for="n in sizes" :key="n" :value="n">{{ n }}×{{ n }}</option>
    </select>
    <button type="button" class="btn btn-sm btn-outline-secondary" :disabled="store.size >= 7" @click="increment">+</button>
  </div>
</template>

<script setup lang="ts">
import { useCubeStore } from '../stores/cube.js'
import type { CubeSize } from '../logic/index.js'

const store = useCubeStore()
const sizes: CubeSize[] = [2, 3, 4, 5, 6, 7]

function onSizeChange(event: Event) {
  const n = Number((event.target as HTMLSelectElement).value) as CubeSize
  store.setSize(n)
}

function decrement(): void {
  if (store.size > 2) store.setSize((store.size - 1) as CubeSize)
}

function increment(): void {
  if (store.size < 7) store.setSize((store.size + 1) as CubeSize)
}
</script>
