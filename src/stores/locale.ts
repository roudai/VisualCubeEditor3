import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'

export type Locale = 'ja' | 'en'

const messages = {
  ja: {
    appTitle: 'Visual Cube Editor 3',
    resetAll: '全リセット',
    puzzleSettings: 'パズル設定',
    algorithm: 'アルゴリズム',
    visualizeSettings: 'ビジュアライズ設定',
    colorScheme: 'カラースキーム',
    viewportRotation: 'ビューポート回転',
    appearance: '外観',
    size: 'サイズ',
    applyMove: '適用',
    moveInputLabel: '手順入力',
    none: 'なし',
    backgroundColor: '背景色',
    cubeColor: 'キューブ色',
    maskColor: 'マスク色',
    cubeOpacity: 'キューブ不透明度',
    stickerOpacity: 'ステッカー不透明度',
    projectionDist: '投影距離',
    reset: 'リセット',
    imageSize: '画像サイズ',
  },
  en: {
    appTitle: 'Visual Cube Editor 3',
    resetAll: 'Reset All',
    puzzleSettings: 'Puzzle Settings',
    algorithm: 'Algorithm',
    visualizeSettings: 'Visualize Settings',
    colorScheme: 'Color Scheme',
    viewportRotation: 'Viewport Rotation',
    appearance: 'Appearance',
    size: 'Size',
    applyMove: 'Apply',
    moveInputLabel: 'Move Input',
    none: 'None',
    backgroundColor: 'Background',
    cubeColor: 'Cube Color',
    maskColor: 'Mask Color',
    cubeOpacity: 'Cube Opacity',
    stickerOpacity: 'Sticker Opacity',
    projectionDist: 'Projection Distance',
    reset: 'Reset',
    imageSize: 'Image Size',
  },
} as const

type MessageKey = keyof typeof messages['ja']

const STORAGE_KEY = 'vce3-locale'

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<Locale>('ja')

  function t(key: MessageKey): string {
    return messages[locale.value][key]
  }

  function toggle(): void {
    locale.value = locale.value === 'ja' ? 'en' : 'ja'
    localStorage.setItem(STORAGE_KEY, locale.value)
  }

  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'ja' || saved === 'en') locale.value = saved
  })

  return { locale, t, toggle }
})
