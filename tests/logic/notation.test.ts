import { describe, it, expect } from 'vitest'
import { parseNotation, moveToNotation } from '../../src/logic/notation.js'
import { Face, Direction } from '../../src/logic/types.js'

describe('parseNotation — 正常系', () => {
  it('空文字列は空の MoveSequence を返す', () => {
    const result = parseNotation('')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toEqual([])
  })

  it('スペースのみは空の MoveSequence を返す', () => {
    const result = parseNotation('   ')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toEqual([])
  })

  it('単一トークン U を解析できる', () => {
    const result = parseNotation('U')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toHaveLength(1)
    expect(result.value[0]).toMatchObject({ face: Face.Up, sliceIndex: 0, direction: Direction.CW })
  })

  it("U' を解析できる（CCW）", () => {
    const result = parseNotation("U'")
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value[0]).toMatchObject({ face: Face.Up, sliceIndex: 0, direction: Direction.CCW })
  })

  it('U2 を解析できる（Double）', () => {
    const result = parseNotation('U2')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value[0]).toMatchObject({ face: Face.Up, sliceIndex: 0, direction: Direction.Double })
  })

  it('全6面（U D F B R L）を解析できる', () => {
    const tokens = ['U', 'D', 'F', 'B', 'R', 'L']
    const faces = [Face.Up, Face.Down, Face.Front, Face.Back, Face.Right, Face.Left]
    for (let i = 0; i < tokens.length; i++) {
      const result = parseNotation(tokens[i]!)
      expect(result.ok).toBe(true)
      if (!result.ok) return
      expect(result.value[0]!.face).toBe(faces[i])
    }
  })

  it("複数トークン \"R U R' U'\" を解析できる", () => {
    const result = parseNotation("R U R' U'")
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toHaveLength(4)
    expect(result.value[0]).toMatchObject({ face: Face.Right, direction: Direction.CW })
    expect(result.value[1]).toMatchObject({ face: Face.Up, direction: Direction.CW })
    expect(result.value[2]).toMatchObject({ face: Face.Right, direction: Direction.CCW })
    expect(result.value[3]).toMatchObject({ face: Face.Up, direction: Direction.CCW })
  })

  it('NxN スライス 2R を解析できる（sliceIndex=1）', () => {
    const result = parseNotation('2R')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value[0]).toMatchObject({ face: Face.Right, sliceIndex: 1, direction: Direction.CW })
  })

  it("NxN スライス 3U' を解析できる（sliceIndex=2, CCW）", () => {
    const result = parseNotation("3U'")
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value[0]).toMatchObject({ face: Face.Up, sliceIndex: 2, direction: Direction.CCW })
  })

  it('Uw（ワイドムーブ）を解析できる（sliceIndex=1）', () => {
    const result = parseNotation('Uw')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value[0]).toMatchObject({ face: Face.Up, sliceIndex: 1, direction: Direction.CW })
  })

  it("Rw2 を解析できる（sliceIndex=1, Double）", () => {
    const result = parseNotation('Rw2')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value[0]).toMatchObject({ face: Face.Right, sliceIndex: 1, direction: Direction.Double })
  })
})

describe('parseNotation — 異常系', () => {
  it('不正なトークン X はエラーを返す', () => {
    const result = parseNotation('X')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_NOTATION')
  })

  it('ローテーション x はエラーを返す', () => {
    const result = parseNotation('x')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_NOTATION')
  })

  it('不正トークンの tokenIndex が正しい（2番目のトークンが不正）', () => {
    const result = parseNotation('U X')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_NOTATION')
    expect(result.error.tokenIndex).toBe(1)
  })

  it('不正トークンの tokenIndex が正しい（1番目のトークンが不正）', () => {
    const result = parseNotation('X U')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.tokenIndex).toBe(0)
  })
})

describe('moveToNotation', () => {
  it('CW は修飾子なし', () => {
    expect(moveToNotation({ face: Face.Up, sliceIndex: 0, direction: Direction.CW }, 3)).toBe('U')
  })

  it("CCW は ' 付き", () => {
    expect(moveToNotation({ face: Face.Right, sliceIndex: 0, direction: Direction.CCW }, 3)).toBe("R'")
  })

  it('Double は 2 付き', () => {
    expect(moveToNotation({ face: Face.Front, sliceIndex: 0, direction: Direction.Double }, 3)).toBe('F2')
  })

  it('sliceIndex=1 は 2 プレフィックス付き', () => {
    expect(moveToNotation({ face: Face.Right, sliceIndex: 1, direction: Direction.CW }, 4)).toBe('2R')
  })

  it("sliceIndex=2 CCW は 3X' 形式", () => {
    expect(moveToNotation({ face: Face.Up, sliceIndex: 2, direction: Direction.CCW }, 5)).toBe("3U'")
  })

  it('全6面の CW を正しく変換できる', () => {
    const cases: [Face, string][] = [
      [Face.Up, 'U'],
      [Face.Down, 'D'],
      [Face.Front, 'F'],
      [Face.Back, 'B'],
      [Face.Right, 'R'],
      [Face.Left, 'L'],
    ]
    for (const [face, expected] of cases) {
      expect(moveToNotation({ face, sliceIndex: 0, direction: Direction.CW }, 3)).toBe(expected)
    }
  })
})

describe('parseNotation ↔ moveToNotation 往復変換', () => {
  it('parseNotation(moveToNotation(m)) で元の Move に戻る', () => {
    const moves = [
      { face: Face.Up, sliceIndex: 0, direction: Direction.CW },
      { face: Face.Right, sliceIndex: 0, direction: Direction.CCW },
      { face: Face.Front, sliceIndex: 0, direction: Direction.Double },
      { face: Face.Left, sliceIndex: 1, direction: Direction.CW },
      { face: Face.Down, sliceIndex: 2, direction: Direction.CCW },
    ]
    for (const move of moves) {
      const notation = moveToNotation(move, 7)
      const result = parseNotation(notation)
      expect(result.ok).toBe(true)
      if (!result.ok) return
      expect(result.value[0]).toMatchObject(move)
    }
  })
})
