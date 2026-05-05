<template>
  <div>
    <div class="d-flex flex-wrap gap-2 mb-2">
      <div v-for="face in FACE_LABELS" :key="face.key" class="text-center">
        <label class="form-label mb-0 small">{{ face.label }}</label>
        <input
          type="color"
          class="form-control form-control-color"
          :value="store.colorScheme[face.key]"
          @input="(e) => updateColor(face.key, (e.target as HTMLInputElement).value)"
        />
      </div>
    </div>
    <div class="d-flex gap-1">
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="store.rotateX()">x</button>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="store.rotateY()">y</button>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="store.rotateZ()">z</button>
      <button type="button" class="btn btn-sm btn-outline-danger ms-auto" data-testid="reset-btn" @click="store.resetColorScheme()">{{ t('reset') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRenderOptionsStore } from '../stores/renderOptions.js'
import { useLocaleStore } from '../stores/locale.js'

const store = useRenderOptionsStore()
const { t } = useLocaleStore()

const FACE_LABELS: { label: string; key: 0 | 1 | 2 | 3 | 4 | 5 }[] = [
  { label: 'U', key: 0 },
  { label: 'D', key: 1 },
  { label: 'F', key: 2 },
  { label: 'B', key: 3 },
  { label: 'R', key: 4 },
  { label: 'L', key: 5 },
]

function updateColor(key: 0 | 1 | 2 | 3 | 4 | 5, value: string): void {
  store.colorScheme = { ...store.colorScheme, [key]: value }
}
</script>
