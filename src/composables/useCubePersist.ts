import { watch, onMounted } from 'vue'
import { useCubeStore } from '../stores/cube.js'
import { serialize, deserialize } from '../logic/index.js'
import type { CubeSize } from '../logic/index.js'

const STORAGE_KEY = 'vce3-cube-state'

export function useCubePersist(): void {
  const store = useCubeStore()

  onMounted(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    let parsed: unknown
    try {
      parsed = JSON.parse(raw) as unknown
    } catch {
      return
    }

    const result = deserialize(parsed)
    if (result.ok) {
      store.cubeState = result.value
      store.size = result.value.size as CubeSize
    }
  })

  watch(
    () => store.cubeState,
    (state) => {
      const serialized = serialize(state)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized))
    },
  )
}
