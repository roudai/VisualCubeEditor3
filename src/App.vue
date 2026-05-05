<template>
  <nav class="navbar navbar-dark bg-dark px-3">
    <h1 class="navbar-brand mb-0 fs-5">Visual Cube Editor 3</h1>
  </nav>

  <div class="container-fluid">
    <div class="row flex-nowrap">
      <div class="col-auto">
        <div class="cube-sticky">
          <CubeDisplay />
          <ImageSizeControl />
        </div>
      </div>

      <div class="col overflow-auto">
        <div class="card mb-3">
          <div class="card-body">
            <h6 class="card-title">パズル設定</h6>
            <SizeSelector />
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-body">
            <h6 class="card-title">アルゴリズム</h6>
            <MoveInput />
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-body">
            <h6 class="card-title">ビジュアライズ設定</h6>
            <SpecialViewControl />
            <hr class="my-2" />
            <StageMaskControl />
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-body">
            <h6 class="card-title">カラースキーム</h6>
            <ColorSchemeControl />
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-body">
            <h6 class="card-title">ビューポート回転</h6>
            <ViewportRotationControl />
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-body">
            <h6 class="card-title">外観</h6>
            <AppearanceControl />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SizeSelector from './components/SizeSelector.vue'
import CubeDisplay from './components/CubeDisplay.vue'
import MoveInput from './components/MoveInput.vue'
import SpecialViewControl from './components/SpecialViewControl.vue'
import StageMaskControl from './components/StageMaskControl.vue'
import ColorSchemeControl from './components/ColorSchemeControl.vue'
import ViewportRotationControl from './components/ViewportRotationControl.vue'
import AppearanceControl from './components/AppearanceControl.vue'
import ImageSizeControl from './components/ImageSizeControl.vue'
import { useCubePersist } from './composables/useCubePersist.js'

useCubePersist()
</script>

<style scoped>
.cube-sticky {
  position: sticky;
  top: 1rem;
}
</style>
