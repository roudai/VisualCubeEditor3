<template>
  <nav class="navbar navbar-dark bg-dark px-3 gap-2">
    <h1 class="navbar-brand mb-0 fs-5">{{ t('appTitle') }}</h1>
    <div class="ms-auto d-flex gap-2 align-items-center">
      <select
        class="form-select form-select-sm"
        style="width: auto"
        :value="localeStore.locale"
        @change="(e) => localeStore.setLocale((e.target as HTMLSelectElement).value as Locale)"
      >
        <option v-for="loc in LOCALES" :key="loc.code" :value="loc.code">{{ loc.label }}</option>
      </select>
      <button type="button" class="btn btn-outline-light btn-sm" @click="resetAll">{{ t('resetAll') }}</button>
    </div>
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
            <h6 class="card-title">{{ t('puzzleSettings') }}</h6>
            <SizeSelector />
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-body">
            <h6 class="card-title">{{ t('algorithm') }}</h6>
            <MoveInput />
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-body">
            <h6 class="card-title">{{ t('visualizeSettings') }}</h6>
            <SpecialViewControl />
            <hr class="my-2" />
            <StageMaskControl />
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-body">
            <h6 class="card-title">{{ t('colorScheme') }}</h6>
            <ColorSchemeControl />
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-body">
            <h6 class="card-title">{{ t('viewportRotation') }}</h6>
            <ViewportRotationControl />
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-body">
            <h6 class="card-title">{{ t('appearance') }}</h6>
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
import { useRenderOptionsStore } from './stores/renderOptions.js'
import { useCubeStore } from './stores/cube.js'
import { useLocaleStore, LOCALES, type Locale } from './stores/locale.js'

useCubePersist()

const renderStore = useRenderOptionsStore()
const cubeStore = useCubeStore()
const localeStore = useLocaleStore()
const { t } = localeStore

function resetAll(): void {
  renderStore.resetAll()
  cubeStore.setSize(3)
}
</script>

<style scoped>
.cube-sticky {
  position: sticky;
  top: 1rem;
}
</style>
