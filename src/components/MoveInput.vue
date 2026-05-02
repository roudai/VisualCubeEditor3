<template>
  <div class="move-input">
    <form @submit.prevent="onSubmit">
      <input
        v-model="input"
        data-testid="notation-input"
        placeholder="R U R' U'"
        aria-label="手順入力"
      />
      <button type="submit">適用</button>
    </form>
    <p v-if="error" class="error" data-testid="error-message">{{ error }}</p>
    <div class="face-buttons">
      <button
        v-for="btn in moveButtons"
        :key="btn.notation"
        @click="onNotation(btn.notation)"
      >{{ btn.label }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCubeStore } from '../stores/cube.js'
import { parseNotation } from '../logic/index.js'

const store = useCubeStore()
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
