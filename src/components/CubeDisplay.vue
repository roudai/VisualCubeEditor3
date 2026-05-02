<template>
  <div class="cube-display" v-html="svgContent" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCubeStore } from '../stores/cube.js'
import { renderSVG } from '../render/index.js'

const store = useCubeStore()

const svgContent = computed(() => {
  const result = renderSVG(store.cubeState)
  return result.ok ? result.value : ''
})
</script>
