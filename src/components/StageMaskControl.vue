<template>
  <div>
    <div class="mb-2">
      <label class="form-label">Stage Mask</label>
      <select class="form-select form-select-sm" v-model="store.mask">
        <option value="">なし</option>
        <option v-for="m in MASK_LIST" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>
    </div>
    <div>
      <label class="form-label">Mask Alg</label>
      <select
        class="form-select form-select-sm"
        v-model="store.maskAlg"
        :disabled="!store.mask"
      >
        <option value="">なし</option>
        <option v-for="alg in MASK_ALG_LIST" :key="alg" :value="alg">{{ alg }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRenderOptionsStore } from '../stores/renderOptions.js'

const store = useRenderOptionsStore()

const MASK_LIST = [
  { label: 'FL', value: 'fl' },
  { label: 'F2L', value: 'f2l' },
  { label: 'LL', value: 'll' },
  { label: 'CLL', value: 'cll' },
  { label: 'ELL', value: 'ell' },
  { label: 'OLL', value: 'oll' },
  { label: 'OCLL', value: 'ocll' },
  { label: 'OELL', value: 'oell' },
  { label: 'COLL', value: 'coll' },
  { label: 'OCELL', value: 'ocell' },
  { label: 'WV', value: 'wv' },
  { label: 'VH', value: 'vh' },
  { label: 'ELS', value: 'els' },
  { label: 'CLS', value: 'cls' },
  { label: 'CMLL', value: 'cmll' },
  { label: 'CROSS', value: 'cross' },
  { label: 'F2L-3', value: 'f2l_3' },
  { label: 'F2L-2', value: 'f2l_2' },
  { label: 'F2L-SM', value: 'f2l_sm' },
  { label: 'F2L-1', value: 'f2l_1' },
  { label: 'F2B', value: 'f2b' },
  { label: 'LINE', value: 'line' },
]

const MASK_ALG_LIST = ["y", "y2", "y'", "x", "x'", "x2", "z", "z'", "z2"]
</script>
