<template>
  <div id="app">
    <header>
      <h1>Visual Cube Editor 3</h1>
      <SizeSelector />
    </header>
    <main>
      <CubeDisplay />
      <MoveInput />
    </main>
  </div>
</template>

<script setup lang="ts">
import SizeSelector from './components/SizeSelector.vue'
import CubeDisplay from './components/CubeDisplay.vue'
import MoveInput from './components/MoveInput.vue'
import { useCubePersist } from './composables/useCubePersist.js'

useCubePersist()
</script>
