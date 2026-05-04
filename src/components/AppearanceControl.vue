<template>
  <div>
    <div class="mb-3">
      <label class="form-label small">背景色</label>
      <input
        type="color"
        class="form-control form-control-color"
        data-testid="background-color"
        v-model="store.backgroundColor"
      />
    </div>

    <div class="mb-3">
      <label class="form-label small">キューブ色</label>
      <input
        type="color"
        class="form-control form-control-color"
        data-testid="cube-color"
        v-model="store.cubeColor"
      />
    </div>

    <div class="mb-3">
      <label class="form-label small">マスク色</label>
      <input
        type="color"
        class="form-control form-control-color"
        data-testid="mask-color"
        v-model="store.maskColor"
      />
    </div>

    <div class="mb-3">
      <label class="form-label small">キューブ不透明度: {{ store.cubeOpacity }}%</label>
      <input
        type="range"
        class="form-range"
        min="0"
        max="100"
        data-testid="cube-opacity"
        v-model.number="store.cubeOpacity"
      />
    </div>

    <div class="mb-3">
      <label class="form-label small">ステッカー不透明度: {{ store.stickerOpacity }}%</label>
      <input
        type="range"
        class="form-range"
        min="0"
        max="100"
        data-testid="sticker-opacity"
        v-model.number="store.stickerOpacity"
      />
    </div>

    <div class="mb-3">
      <label class="form-label small">投影距離: {{ store.dist }}</label>
      <input
        type="range"
        class="form-range"
        min="1"
        max="100"
        data-testid="dist"
        v-model.number="store.dist"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRenderOptionsStore } from '../stores/renderOptions.js'

const store = useRenderOptionsStore()
</script>
