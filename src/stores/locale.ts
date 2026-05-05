import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'

// 対応言語を追加するときはここだけ編集する
export const LOCALES = [
  { code: 'ja', label: '日本語' },
  { code: 'en', label: 'English' },
] as const

export type Locale = (typeof LOCALES)[number]['code']

const messages: Record<Locale, Record<string, string>> = {
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
}

type MessageKey = keyof typeof messages['ja']

const STORAGE_KEY = 'vce3-locale'

const LOCALE_CODES = LOCALES.map((l) => l.code)

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<Locale>('ja')

  function t(key: MessageKey): string {
    return messages[locale.value][key] ?? key
  }

  function setLocale(code: Locale): void {
    locale.value = code
    localStorage.setItem(STORAGE_KEY, code)
  }

  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && (LOCALE_CODES as readonly string[]).includes(saved)) {
      locale.value = saved as Locale
    }
  })

  return { locale, t, setLocale }
})
