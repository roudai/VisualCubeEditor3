<template>
  <div class="row g-2">
    <div v-for="(rotation, i) in store.viewportRotations" :key="i" class="col-12">
      <div class="d-flex align-items-center gap-2">
        <select
          class="form-select form-select-sm w-auto"
          :value="rotation[0]"
          @change="(e) => updateAxis(i, (e.target as HTMLSelectElement).value as ViewAxis)"
        >
          <option v-for="ax in AXES" :key="ax" :value="ax">{{ ax }}</option>
        </select>
        <input
          type="range"
          class="form-range flex-grow-1"
          min="-180"
          max="180"
          :value="rotation[1]"
          @input="(e) => updateAngle(i, Number((e.target as HTMLInputElement).value))"
        />
        <input
          type="number"
          class="form-control form-control-sm"
          style="width: 72px"
          min="-180"
          max="180"
          :value="rotation[1]"
          @input="(e) => updateAngle(i, Number((e.target as HTMLInputElement).value))"
        />
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetSlot(i)">Reset</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRenderOptionsStore } from '../stores/renderOptions.js'
import type { ViewAxis } from '../render/types.js'

const store = useRenderOptionsStore()

const AXES: ViewAxis[] = ['x', 'y', 'z']
const DEFAULTS: [ViewAxis, number][] = [['y', 45], ['x', -34], ['z', 0]]

function updateAxis(i: number, axis: ViewAxis): void {
  const rotations = store.viewportRotations.map((r) => [...r] as [ViewAxis, number])
  rotations[i] = [axis, rotations[i]![1]]
  store.viewportRotations = rotations
}

function updateAngle(i: number, angle: number): void {
  const rotations = store.viewportRotations.map((r) => [...r] as [ViewAxis, number])
  rotations[i] = [rotations[i]![0], angle]
  store.viewportRotations = rotations
}

function resetSlot(i: number): void {
  const rotations = store.viewportRotations.map((r) => [...r] as [ViewAxis, number])
  rotations[i] = [...DEFAULTS[i]!]
  store.viewportRotations = rotations
}
</script>
