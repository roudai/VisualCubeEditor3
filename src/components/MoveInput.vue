<template>
  <div>
    <form class="input-group mb-2" @submit.prevent="onSubmit">
      <input
        class="form-control form-control-sm"
        v-model="input"
        data-testid="notation-input"
        placeholder="R U R' U'"
        :aria-label="t('moveInputLabel')"
      />
      <button class="btn btn-outline-secondary btn-sm" type="submit">
        {{ t('applyMove') }}
      </button>
    </form>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCubeStore } from '../stores/cube.js'
import { parseNotation } from '../logic/index.js'
import { useLocaleStore } from '../stores/locale.js'

const store = useCubeStore()
const { t } = useLocaleStore()
const input = ref('')
const error = ref<string | null>(null)

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

function onSubmit(): void {
  const raw = input.value.trim()
  if (!raw) return

  const result = parseNotation(raw)
  if (!result.ok) {
    error.value = result.error.message
    return
  }

  error.value = null
  store.applySequence(result.value)
  input.value = ''
}

function onNotation(notation: string): void {
  const result = parseNotation(notation)
  if (!result.ok) return
  const move = result.value[0]
  if (move) store.applyMove(move)
}
</script>
