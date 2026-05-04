import { defineStore } from 'pinia'
import { ref, computed, watch, onMounted } from 'vue'
import { DEFAULT_COLOR_SCHEME } from '../render/defaults.js'
import type { RenderOptions, ViewAxis } from '../render/types.js'

const STORAGE_KEY = 'vce3-render-options'

export const useRenderOptionsStore = defineStore('renderOptions', () => {
  const imageSize = ref(128)
  const view = ref<'normal' | 'plan'>('normal')
  const mask = ref('')
  const maskAlg = ref('')
  const colorScheme = ref<Record<0 | 1 | 2 | 3 | 4 | 5, string>>({ ...DEFAULT_COLOR_SCHEME })
  const backgroundColor = ref('#ffffff')
  const cubeColor = ref('#000000')
  const maskColor = ref('#404040')
  const cubeOpacity = ref(100)
  const stickerOpacity = ref(100)
  const dist = ref(5)
  const viewportRotations = ref<[ViewAxis, number][]>([
    ['y', 45],
    ['x', -34],
    ['z', 0],
  ])
  const arrows = ref('')

  const renderOptions = computed((): RenderOptions => ({
    width: imageSize.value,
    height: imageSize.value,
    colorScheme: colorScheme.value,
    backgroundColor: backgroundColor.value,
    cubeColor: cubeColor.value,
    maskColor: maskColor.value,
    cubeOpacity: cubeOpacity.value,
    stickerOpacity: stickerOpacity.value,
    dist: dist.value,
    viewportRotations: viewportRotations.value,
    ...(view.value === 'plan' && { view: 'plan' }),
    ...(mask.value && { mask: mask.value }),
    ...(mask.value && maskAlg.value && { maskAlg: maskAlg.value }),
    ...(arrows.value && { arrows: arrows.value }),
  }))

  // a←b←c←d←(original a)
  function cycleFaceColors(
    a: 0 | 1 | 2 | 3 | 4 | 5,
    b: 0 | 1 | 2 | 3 | 4 | 5,
    c: 0 | 1 | 2 | 3 | 4 | 5,
    d: 0 | 1 | 2 | 3 | 4 | 5,
  ): void {
    const s = { ...colorScheme.value }
    const [ca, cb, cc, cd] = [s[a], s[b], s[c], s[d]]
    s[a] = cb
    s[b] = cc
    s[c] = cd
    s[d] = ca
    colorScheme.value = s
  }

  // U←B, B←D, D←F, F←U
  function rotateX(): void {
    cycleFaceColors(0, 3, 1, 2)
  }

  // F←R, R←B, B←L, L←F
  function rotateY(): void {
    cycleFaceColors(2, 4, 3, 5)
  }

  // U←L, L←D, D←R, R←U
  function rotateZ(): void {
    cycleFaceColors(0, 5, 1, 4)
  }

  function resetColorScheme(): void {
    colorScheme.value = { ...DEFAULT_COLOR_SCHEME }
  }

  // Constitution VI: localStorage 自動保存
  watch(
    () => ({
      imageSize: imageSize.value,
      view: view.value,
      mask: mask.value,
      maskAlg: maskAlg.value,
      colorScheme: { ...colorScheme.value },
      backgroundColor: backgroundColor.value,
      cubeColor: cubeColor.value,
      maskColor: maskColor.value,
      cubeOpacity: cubeOpacity.value,
      stickerOpacity: stickerOpacity.value,
      dist: dist.value,
      viewportRotations: viewportRotations.value,
      arrows: arrows.value,
    }),
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, ...val }))
    },
    { deep: true },
  )

  // Constitution VI: マウント時に localStorage から復元
  onMounted(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const data = JSON.parse(raw) as Record<string, unknown>
      if (data['v'] !== 1) return
      if (typeof data['imageSize'] === 'number') imageSize.value = data['imageSize']
      if (data['view'] === 'normal' || data['view'] === 'plan') view.value = data['view']
      if (typeof data['mask'] === 'string') mask.value = data['mask']
      if (typeof data['maskAlg'] === 'string') maskAlg.value = data['maskAlg']
      if (typeof data['backgroundColor'] === 'string') backgroundColor.value = data['backgroundColor']
      if (typeof data['cubeColor'] === 'string') cubeColor.value = data['cubeColor']
      if (typeof data['maskColor'] === 'string') maskColor.value = data['maskColor']
      if (typeof data['cubeOpacity'] === 'number') cubeOpacity.value = data['cubeOpacity']
      if (typeof data['stickerOpacity'] === 'number') stickerOpacity.value = data['stickerOpacity']
      if (typeof data['dist'] === 'number') dist.value = data['dist']
      if (typeof data['arrows'] === 'string') arrows.value = data['arrows']
      if (Array.isArray(data['viewportRotations'])) {
        viewportRotations.value = data['viewportRotations'] as [ViewAxis, number][]
      }
      if (data['colorScheme'] !== null && typeof data['colorScheme'] === 'object') {
        colorScheme.value = data['colorScheme'] as Record<0 | 1 | 2 | 3 | 4 | 5, string>
      }
    } catch {
      // 不正データは無視してデフォルト値を維持
    }
  })

  return {
    imageSize,
    view,
    mask,
    maskAlg,
    colorScheme,
    backgroundColor,
    cubeColor,
    maskColor,
    cubeOpacity,
    stickerOpacity,
    dist,
    viewportRotations,
    arrows,
    renderOptions,
    resetColorScheme,
    rotateX,
    rotateY,
    rotateZ,
  }
})
