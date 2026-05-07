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
      const token = tokens[i]
      if (token === undefined) continue
      const result = parseNotation(token)
      expect(result.ok).toBe(true)
      if (!result.ok) return
      expect(result.value[0]?.face).toBe(faces[i])
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

  it('Uw（ワイドムーブ）を解析できる（外層+内層の2ムーブ）', () => {
    const result = parseNotation('Uw')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toHaveLength(2)
    expect(result.value[0]).toMatchObject({ face: Face.Up, sliceIndex: 0, direction: Direction.CW })
    expect(result.value[1]).toMatchObject({ face: Face.Up, sliceIndex: 1, direction: Direction.CW })
  })

  it("Rw2 を解析できる（外層+内層の2ムーブ, Double）", () => {
    const result = parseNotation('Rw2')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toHaveLength(2)
    expect(result.value[0]).toMatchObject({ face: Face.Right, sliceIndex: 0, direction: Direction.Double })
    expect(result.value[1]).toMatchObject({ face: Face.Right, sliceIndex: 1, direction: Direction.Double })
  })

  it('u → Uw と同じ外層+内層の2ムーブ', () => {
    const result = parseNotation('u')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toHaveLength(2)
    expect(result.value[0]).toMatchObject({ face: Face.Up, sliceIndex: 0, direction: Direction.CW })
    expect(result.value[1]).toMatchObject({ face: Face.Up, sliceIndex: 1, direction: Direction.CW })
  })

  it('r → Right 面の外層+内層の2ムーブ', () => {
    const result = parseNotation('r')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toHaveLength(2)
    expect(result.value[0]).toMatchObject({ face: Face.Right, sliceIndex: 0, direction: Direction.CW })
    expect(result.value[1]).toMatchObject({ face: Face.Right, sliceIndex: 1, direction: Direction.CW })
  })

  it.each([
    ['d', Face.Down],
    ['f', Face.Front],
    ['l', Face.Left],
    ['b', Face.Back],
  ] as [string, Face][])('%s → %s 面の外層+内層の2ムーブ', (token, face) => {
    const result = parseNotation(token)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toHaveLength(2)
    expect(result.value[0]).toMatchObject({ face, sliceIndex: 0, direction: Direction.CW })
    expect(result.value[1]).toMatchObject({ face, sliceIndex: 1, direction: Direction.CW })
  })
})

describe('parseNotation — 中層ムーブ（M / E / S）', () => {
  it('M → {face:Left, sliceIndex:1, direction:CW}', () => {
    const result = parseNotation('M')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toHaveLength(1)
    expect(result.value[0]).toMatchObject({ face: Face.Left, sliceIndex: 1, direction: Direction.CW })
  })

  it("M' → {face:Left, sliceIndex:1, direction:CCW}", () => {
    const result = parseNotation("M'")
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value[0]).toMatchObject({ face: Face.Left, sliceIndex: 1, direction: Direction.CCW })
  })

  it('M2 → {face:Left, sliceIndex:1, direction:Double}', () => {
    const result = parseNotation('M2')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value[0]).toMatchObject({ face: Face.Left, sliceIndex: 1, direction: Direction.Double })
  })

  it('E → {face:Down, sliceIndex:1, direction:CW}', () => {
    const result = parseNotation('E')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value[0]).toMatchObject({ face: Face.Down, sliceIndex: 1, direction: Direction.CW })
  })

  it('S → {face:Front, sliceIndex:1, direction:CW}', () => {
    const result = parseNotation('S')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value[0]).toMatchObject({ face: Face.Front, sliceIndex: 1, direction: Direction.CW })
  })

  it('m（小文字）→ INVALID_NOTATION エラー', () => {
    const result = parseNotation('m')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_NOTATION')
  })
})

describe('parseNotation — 異常系', () => {
  it('不正なトークン X はエラーを返す', () => {
    const result = parseNotation('X')
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

  it('3x3 の sliceIndex=1 は w 記法（Uw）', () => {
    expect(moveToNotation({ face: Face.Up, sliceIndex: 1, direction: Direction.CW }, 3)).toBe('Uw')
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

describe('parseNotation — キューブ回転（x / y / z）', () => {
  it('x（size=3）→ 3ムーブ [{R,0,CW},{R,1,CW},{L,0,CCW}]', () => {
    const result = parseNotation('x', 3)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toHaveLength(3)
    expect(result.value[0]).toMatchObject({ face: Face.Right, sliceIndex: 0, direction: Direction.CW })
    expect(result.value[1]).toMatchObject({ face: Face.Right, sliceIndex: 1, direction: Direction.CW })
    expect(result.value[2]).toMatchObject({ face: Face.Left,  sliceIndex: 0, direction: Direction.CCW })
  })

  it('y（size=3）→ 3ムーブ [{U,0,CW},{U,1,CW},{D,0,CCW}]', () => {
    const result = parseNotation('y', 3)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toHaveLength(3)
    expect(result.value[0]).toMatchObject({ face: Face.Up,   sliceIndex: 0, direction: Direction.CW })
    expect(result.value[1]).toMatchObject({ face: Face.Up,   sliceIndex: 1, direction: Direction.CW })
    expect(result.value[2]).toMatchObject({ face: Face.Down, sliceIndex: 0, direction: Direction.CCW })
  })

  it('z（size=3）→ 3ムーブ [{F,0,CW},{F,1,CW},{B,0,CCW}]', () => {
    const result = parseNotation('z', 3)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toHaveLength(3)
    expect(result.value[0]).toMatchObject({ face: Face.Front, sliceIndex: 0, direction: Direction.CW })
    expect(result.value[1]).toMatchObject({ face: Face.Front, sliceIndex: 1, direction: Direction.CW })
    expect(result.value[2]).toMatchObject({ face: Face.Back,  sliceIndex: 0, direction: Direction.CCW })
  })

  it("x'（size=3）→ 方向反転 [{R,0,CCW},{R,1,CCW},{L,0,CW}]", () => {
    const result = parseNotation("x'", 3)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toHaveLength(3)
    expect(result.value[0]).toMatchObject({ face: Face.Right, sliceIndex: 0, direction: Direction.CCW })
    expect(result.value[1]).toMatchObject({ face: Face.Right, sliceIndex: 1, direction: Direction.CCW })
    expect(result.value[2]).toMatchObject({ face: Face.Left,  sliceIndex: 0, direction: Direction.CW })
  })

  it('x2（size=3）→ Double [{R,0,Double},{R,1,Double},{L,0,Double}]', () => {
    const result = parseNotation('x2', 3)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toHaveLength(3)
    expect(result.value[0]).toMatchObject({ face: Face.Right, sliceIndex: 0, direction: Direction.Double })
    expect(result.value[1]).toMatchObject({ face: Face.Right, sliceIndex: 1, direction: Direction.Double })
    expect(result.value[2]).toMatchObject({ face: Face.Left,  sliceIndex: 0, direction: Direction.Double })
  })

  it('x（size=4）→ 4ムーブ [{R,0,CW},{R,1,CW},{L,0,CCW},{L,1,CCW}]', () => {
    const result = parseNotation('x', 4)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toHaveLength(4)
    expect(result.value[0]).toMatchObject({ face: Face.Right, sliceIndex: 0, direction: Direction.CW })
    expect(result.value[1]).toMatchObject({ face: Face.Right, sliceIndex: 1, direction: Direction.CW })
    expect(result.value[2]).toMatchObject({ face: Face.Left,  sliceIndex: 0, direction: Direction.CCW })
    expect(result.value[3]).toMatchObject({ face: Face.Left,  sliceIndex: 1, direction: Direction.CCW })
  })

  it('x（size=5）→ 5ムーブ [{R,0,CW},{R,1,CW},{R,2,CW},{L,0,CCW},{L,1,CCW}]', () => {
    const result = parseNotation('x', 5)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toHaveLength(5)
    expect(result.value[0]).toMatchObject({ face: Face.Right, sliceIndex: 0, direction: Direction.CW })
    expect(result.value[1]).toMatchObject({ face: Face.Right, sliceIndex: 1, direction: Direction.CW })
    expect(result.value[2]).toMatchObject({ face: Face.Right, sliceIndex: 2, direction: Direction.CW })
    expect(result.value[3]).toMatchObject({ face: Face.Left,  sliceIndex: 0, direction: Direction.CCW })
    expect(result.value[4]).toMatchObject({ face: Face.Left,  sliceIndex: 1, direction: Direction.CCW })
  })

  it('X（大文字）→ INVALID_NOTATION エラー', () => {
    const result = parseNotation('X')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_NOTATION')
  })
})

describe('parseNotation ↔ moveToNotation 往復変換', () => {
  it('parseNotation(moveToNotation(m)) で元の Move に戻る', () => {
    // sliceIndex=1 は ワイドムーブ展開後に往復不成立（Uw → 2ムーブ）のため除外
    const moves = [
      { face: Face.Up, sliceIndex: 0, direction: Direction.CW },
      { face: Face.Right, sliceIndex: 0, direction: Direction.CCW },
      { face: Face.Front, sliceIndex: 0, direction: Direction.Double },
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
