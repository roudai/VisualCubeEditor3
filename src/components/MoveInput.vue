<template>
  <div>
    <div class="mb-2">
      <select
        class="form-select form-select-sm"
        data-testid="alg-mode-select"
        v-model="algMode"
        :aria-label="t('algorithm')"
      >
        <option value="apply">{{ t('algModeApply') }}</option>
        <option value="case">{{ t('algModeCase') }}</option>
      </select>
    </div>
    <div class="input-group mb-2">
      <input
        class="form-control form-control-sm"
        v-model="input"
        data-testid="notation-input"
        placeholder="R U R' U'"
        :aria-label="t('moveInputLabel')"
      />
    </div>
    <p v-if="error" class="text-danger small mb-2" data-testid="error-message">{{ error }}</p>
    <div class="face-buttons row row-cols-4 row-cols-sm-6 g-1">
      <div class="col" v-for="btn in moveButtons" :key="btn.notation">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary w-100"
          @click="onNotation(btn.notation)"
        >{{ btn.label }}</button>
      </div>
    </div>
    <div class="inner-move-buttons row row-cols-4 row-cols-sm-6 g-1 mt-1">
      <div class="col" v-for="btn in innerMoveButtons" :key="btn.notation">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary w-100"
          @click="onNotation(btn.notation)"
        >{{ btn.label }}</button>
      </div>
    </div>
    <div class="rotation-buttons row row-cols-4 row-cols-sm-6 g-1 mt-1">
      <div class="col" v-for="btn in rotationButtons" :key="btn.notation">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary w-100"
          @click="onNotation(btn.notation)"
        >{{ btn.label }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRaw } from 'vue'
import { useCubeStore } from '../stores/cube.js'
import { parseNotation, invertSequence } from '../logic/index.js'
import { useLocaleStore } from '../stores/locale.js'
import type { CubeState } from '../logic/index.js'

type AlgMode = 'apply' | 'case'

const store = useCubeStore()
const { t } = useLocaleStore()
const input = ref('')
const error = ref<string | null>(null)
const algMode = ref<AlgMode>('apply')

let baseState: CubeState = JSON.parse(JSON.stringify(toRaw(store.cubeState))) as CubeState

watch([input, algMode], ([newInput, newMode]) => {
  const raw = (newInput as string).trim()
  if (!raw) {
    store.loadState(JSON.parse(JSON.stringify(baseState)) as CubeState)
    error.value = null
    return
  }
  const result = parseNotation(raw, store.size)
  if (!result.ok) {
    error.value = result.error.message
    return
  }
  error.value = null
  store.loadState(JSON.parse(JSON.stringify(baseState)) as CubeState)
  const sequence = (newMode as AlgMode) === 'case' ? invertSequence(result.value) : result.value
  store.applySequence(sequence)
}, { flush: 'sync' })

const moveButtons = [
  { label: 'U', notation: 'U' },
  { label: "U'", notation: "U'" },
  { label: 'D', notation: 'D' },
  { label: "D'", notation: "D'" },
  { label: 'R', notation: 'R' },
  { label: "R'", notation: "R'" },
  { label: 'L', notation: 'L' },
  { label: "L'", notation: "L'" },
  { label: 'F', notation: 'F' },
  { label: "F'", notation: "F'" },
  { label: 'B', notation: 'B' },
  { label: "B'", notation: "B'" },
]

const innerMoveButtons = [
  { label: 'M',  notation: 'M' },
  { label: "M'", notation: "M'" },
  { label: 'E',  notation: 'E' },
  { label: "E'", notation: "E'" },
  { label: 'S',  notation: 'S' },
  { label: "S'", notation: "S'" },
]

const rotationButtons = [
  { label: 'x',  notation: 'x' },
  { label: "x'", notation: "x'" },
  { label: 'y',  notation: 'y' },
  { label: "y'", notation: "y'" },
  { label: 'z',  notation: 'z' },
  { label: "z'", notation: "z'" },
]

function onNotation(notation: string): void {
  const current = input.value.trim()
  input.value = current ? `${current} ${notation}` : notation
}

function clear(): void {
  baseState = JSON.parse(JSON.stringify(toRaw(store.cubeState))) as CubeState
  input.value = ''
  error.value = null
}

defineExpose({ clear })
</script>
