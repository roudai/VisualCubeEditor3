<template>
  <div class="size-selector">
    <label for="cube-size">サイズ:</label>
    <select id="cube-size" :value="store.size" @change="onSizeChange">
      <option v-for="n in sizes" :key="n" :value="n">{{ n }}×{{ n }}</option>
    </select>
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
</script>
