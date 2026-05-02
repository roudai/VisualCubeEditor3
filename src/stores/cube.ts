import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createCube,
  applyMove as logicApplyMove,
  applySequence as logicApplySequence,
} from '../logic/index.js'
import type { CubeState, CubeSize, Move, MoveSequence } from '../logic/index.js'

function makeSolvedCube(n: CubeSize): CubeState {
  const result = createCube(n)
  if (!result.ok) throw new Error(result.error.message)
  return result.value
}

export const useCubeStore = defineStore('cube', () => {
  const size = ref<CubeSize>(3)
  const cubeState = ref<CubeState>(makeSolvedCube(3))

  function applyMove(move: Move): void {
    const result = logicApplyMove(cubeState.value, move)
    if (result.ok) cubeState.value = result.value
  }

  function applySequence(moves: MoveSequence): void {
    const result = logicApplySequence(cubeState.value, moves)
    if (result.ok) cubeState.value = result.value
  }

  function reset(): void {
    cubeState.value = makeSolvedCube(size.value)
  }

  function setSize(n: CubeSize): void {
    size.value = n
    cubeState.value = makeSolvedCube(n)
  }

  return { size, cubeState, applyMove, applySequence, reset, setSize }
})
