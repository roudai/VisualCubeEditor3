// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useRenderOptionsStore } from '../../src/stores/renderOptions.js'
import { DEFAULT_COLOR_SCHEME } from '../../src/render/defaults.js'

const STORAGE_KEY = 'vce3-render-options'

// onMounted を発火させるためのテスト用コンポーネント
const TestComponent = defineComponent({
  setup() {
    useRenderOptionsStore()
    return {}
  },
  template: '<div></div>',
})

describe('useRenderOptionsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  // ---------------------------------------------------------------------------
  // デフォルト値
  // ---------------------------------------------------------------------------

  describe('デフォルト値', () => {
    it('imageSize は 128', () => {
      const store = useRenderOptionsStore()
      expect(store.imageSize).toBe(128)
    })

    it('view は "normal"', () => {
      const store = useRenderOptionsStore()
      expect(store.view).toBe('normal')
    })

    it('mask は ""', () => {
      const store = useRenderOptionsStore()
      expect(store.mask).toBe('')
    })

    it('maskAlg は ""', () => {
      const store = useRenderOptionsStore()
      expect(store.maskAlg).toBe('')
    })

    it('backgroundColor は "#ffffff"', () => {
      const store = useRenderOptionsStore()
      expect(store.backgroundColor).toBe('#ffffff')
    })

    it('cubeColor は "#000000"', () => {
      const store = useRenderOptionsStore()
      expect(store.cubeColor).toBe('#000000')
    })

    it('maskColor は "#404040"', () => {
      const store = useRenderOptionsStore()
      expect(store.maskColor).toBe('#404040')
    })

    it('cubeOpacity は 100', () => {
      const store = useRenderOptionsStore()
      expect(store.cubeOpacity).toBe(100)
    })

    it('stickerOpacity は 100', () => {
      const store = useRenderOptionsStore()
      expect(store.stickerOpacity).toBe(100)
    })

    it('dist は 5', () => {
      const store = useRenderOptionsStore()
      expect(store.dist).toBe(5)
    })

    it('arrows は ""', () => {
      const store = useRenderOptionsStore()
      expect(store.arrows).toBe('')
    })

    it('viewportRotations は [y/45, x/-34, z/0]', () => {
      const store = useRenderOptionsStore()
      expect(store.viewportRotations).toEqual([
        ['y', 45],
        ['x', -34],
        ['z', 0],
      ])
    })

    it('colorScheme は WCA 標準色', () => {
      const store = useRenderOptionsStore()
      expect(store.colorScheme).toEqual(DEFAULT_COLOR_SCHEME)
    })
  })

  // ---------------------------------------------------------------------------
  // rotateX — U←B, B←D, D←F, F←U
  // ---------------------------------------------------------------------------

  describe('rotateX', () => {
    it('U←B, B←D, D←F, F←U で色を循環する', () => {
      const store = useRenderOptionsStore()
      const before = { ...store.colorScheme }
      store.rotateX()
      const after = store.colorScheme
      expect(after[0]).toBe(before[3]) // U ← B
      expect(after[3]).toBe(before[1]) // B ← D
      expect(after[1]).toBe(before[2]) // D ← F
      expect(after[2]).toBe(before[0]) // F ← U
      expect(after[4]).toBe(before[4]) // R は変化しない
      expect(after[5]).toBe(before[5]) // L は変化しない
    })

    it('4回実行すると元の状態に戻る', () => {
      const store = useRenderOptionsStore()
      const before = { ...store.colorScheme }
      for (let i = 0; i < 4; i++) store.rotateX()
      expect(store.colorScheme).toEqual(before)
    })
  })

  // ---------------------------------------------------------------------------
  // rotateY — F←R, R←B, B←L, L←F
  // ---------------------------------------------------------------------------

  describe('rotateY', () => {
    it('F←R, R←B, B←L, L←F で色を循環する', () => {
      const store = useRenderOptionsStore()
      const before = { ...store.colorScheme }
      store.rotateY()
      const after = store.colorScheme
      expect(after[2]).toBe(before[4]) // F ← R
      expect(after[4]).toBe(before[3]) // R ← B
      expect(after[3]).toBe(before[5]) // B ← L
      expect(after[5]).toBe(before[2]) // L ← F
      expect(after[0]).toBe(before[0]) // U は変化しない
      expect(after[1]).toBe(before[1]) // D は変化しない
    })

    it('4回実行すると元の状態に戻る', () => {
      const store = useRenderOptionsStore()
      const before = { ...store.colorScheme }
      for (let i = 0; i < 4; i++) store.rotateY()
      expect(store.colorScheme).toEqual(before)
    })
  })

  // ---------------------------------------------------------------------------
  // rotateZ — U←L, L←D, D←R, R←U
  // ---------------------------------------------------------------------------

  describe('rotateZ', () => {
    it('U←L, L←D, D←R, R←U で色を循環する', () => {
      const store = useRenderOptionsStore()
      const before = { ...store.colorScheme }
      store.rotateZ()
      const after = store.colorScheme
      expect(after[0]).toBe(before[5]) // U ← L
      expect(after[5]).toBe(before[1]) // L ← D
      expect(after[1]).toBe(before[4]) // D ← R
      expect(after[4]).toBe(before[0]) // R ← U
      expect(after[2]).toBe(before[2]) // F は変化しない
      expect(after[3]).toBe(before[3]) // B は変化しない
    })

    it('4回実行すると元の状態に戻る', () => {
      const store = useRenderOptionsStore()
      const before = { ...store.colorScheme }
      for (let i = 0; i < 4; i++) store.rotateZ()
      expect(store.colorScheme).toEqual(before)
    })
  })

  // ---------------------------------------------------------------------------
  // resetColorScheme
  // ---------------------------------------------------------------------------

  describe('resetColorScheme', () => {
    it('rotateX 後に WCA 標準色へ戻る', () => {
      const store = useRenderOptionsStore()
      store.rotateX()
      expect(store.colorScheme).not.toEqual(DEFAULT_COLOR_SCHEME)
      store.resetColorScheme()
      expect(store.colorScheme).toEqual(DEFAULT_COLOR_SCHEME)
    })

    it('任意の色変更後に WCA 標準色へ戻る', () => {
      const store = useRenderOptionsStore()
      store.colorScheme = { 0: '#111111', 1: '#222222', 2: '#333333', 3: '#444444', 4: '#555555', 5: '#666666' }
      store.resetColorScheme()
      expect(store.colorScheme).toEqual(DEFAULT_COLOR_SCHEME)
    })
  })

  // ---------------------------------------------------------------------------
  // renderOptions computed
  // ---------------------------------------------------------------------------

  describe('renderOptions computed', () => {
    it('width と height は imageSize と等しい', () => {
      const store = useRenderOptionsStore()
      expect(store.renderOptions.width).toBe(128)
      expect(store.renderOptions.height).toBe(128)
    })

    it('imageSize 変更が width/height に反映される', () => {
      const store = useRenderOptionsStore()
      store.imageSize = 256
      expect(store.renderOptions.width).toBe(256)
      expect(store.renderOptions.height).toBe(256)
    })

    it('view="normal" のとき view フィールドが含まれない', () => {
      const store = useRenderOptionsStore()
      expect(store.view).toBe('normal')
      expect(store.renderOptions).not.toHaveProperty('view')
    })

    it('view="plan" のとき { view: "plan" } が含まれる', () => {
      const store = useRenderOptionsStore()
      store.view = 'plan'
      expect(store.renderOptions.view).toBe('plan')
    })

    it('mask="" のとき mask フィールドが含まれない', () => {
      const store = useRenderOptionsStore()
      expect(store.mask).toBe('')
      expect(store.renderOptions).not.toHaveProperty('mask')
    })

    it('mask="oll" のとき { mask: "oll" } が含まれる', () => {
      const store = useRenderOptionsStore()
      store.mask = 'oll'
      expect(store.renderOptions.mask).toBe('oll')
    })

    it('mask="" かつ maskAlg="y" のとき maskAlg フィールドが含まれない', () => {
      const store = useRenderOptionsStore()
      store.maskAlg = 'y'
      expect(store.renderOptions).not.toHaveProperty('maskAlg')
    })

    it('mask="oll" かつ maskAlg="y" のとき { maskAlg: "y" } が含まれる', () => {
      const store = useRenderOptionsStore()
      store.mask = 'oll'
      store.maskAlg = 'y'
      expect(store.renderOptions.maskAlg).toBe('y')
    })

    it('arrows="" のとき arrows フィールドが含まれない', () => {
      const store = useRenderOptionsStore()
      expect(store.renderOptions).not.toHaveProperty('arrows')
    })

    it('arrows に値を設定すると含まれる', () => {
      const store = useRenderOptionsStore()
      store.arrows = 'UFR-UFR'
      expect(store.renderOptions.arrows).toBe('UFR-UFR')
    })
  })

  // ---------------------------------------------------------------------------
  // localStorage 永続化（Constitution VI 準拠）
  // ---------------------------------------------------------------------------

  describe('localStorage 永続化', () => {
    it('imageSize 変更時に localStorage へ保存される', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      mount(TestComponent, { global: { plugins: [pinia] } })
      const store = useRenderOptionsStore()

      store.imageSize = 256
      await nextTick()

      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    })

    it('保存データは有効な JSON', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      mount(TestComponent, { global: { plugins: [pinia] } })
      const store = useRenderOptionsStore()

      store.imageSize = 200
      await nextTick()

      const raw = localStorage.getItem(STORAGE_KEY)
      expect(raw).not.toBeNull()
      expect(() => JSON.parse(raw!)).not.toThrow()
    })

    it('マウント時に localStorage から imageSize が復元される', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, imageSize: 300 }))

      const pinia = createPinia()
      setActivePinia(pinia)
      mount(TestComponent, { global: { plugins: [pinia] } })
      const store = useRenderOptionsStore()
      await flushPromises()

      expect(store.imageSize).toBe(300)
    })

    it('マウント時に localStorage から view が復元される', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, view: 'plan' }))

      const pinia = createPinia()
      setActivePinia(pinia)
      mount(TestComponent, { global: { plugins: [pinia] } })
      const store = useRenderOptionsStore()
      await flushPromises()

      expect(store.view).toBe('plan')
    })

    it('不正 JSON の場合はデフォルト値のまま', async () => {
      localStorage.setItem(STORAGE_KEY, 'INVALID{JSON}')

      const pinia = createPinia()
      setActivePinia(pinia)
      mount(TestComponent, { global: { plugins: [pinia] } })
      const store = useRenderOptionsStore()
      await flushPromises()

      expect(store.imageSize).toBe(128)
      expect(store.view).toBe('normal')
    })

    it('localStorage が空の場合はデフォルト値のまま', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      mount(TestComponent, { global: { plugins: [pinia] } })
      const store = useRenderOptionsStore()
      await flushPromises()

      expect(store.imageSize).toBe(128)
      expect(store.view).toBe('normal')
    })
  })
})
