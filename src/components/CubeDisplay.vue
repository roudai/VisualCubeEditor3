<template>
  <div class="cube-display" v-html="svgContent" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCubeStore } from '../stores/cube.js'
import { useRenderOptionsStore } from '../stores/renderOptions.js'
import { renderSVG } from '../render/index.js'

const cubeStore = useCubeStore()
const renderStore = useRenderOptionsStore()

const svgContent = computed(() => {
  const result = renderSVG(cubeStore.cubeState, renderStore.renderOptions)
  return result.ok ? result.value : ''
})
</script>
