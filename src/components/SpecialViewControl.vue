<template>
  <div>
    <div v-for="opt in ['normal', 'plan']" :key="opt" class="form-check">
      <input
        class="form-check-input"
        type="radio"
        :id="`view-${opt}`"
        :value="opt"
        v-model="store.view"
      />
      <label class="form-check-label" :for="`view-${opt}`">{{ opt }}</label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRenderOptionsStore } from '../stores/renderOptions.js'

const store = useRenderOptionsStore()
</script>
