// 「夢文」演出（dreamGlitch）用のユーティリティ。
// 文字ごとに決定的（再レンダリングしてもブレない）なスタイルと、タイピング速度を返す。

// id + index から 0〜1 の決定的な擬似乱数を作る
function seeded(id: string, index: number, salt: number): number {
  let h = 2166136261 ^ salt
  const str = `${id}:${index}`
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  // 0〜1 に正規化
  return ((h >>> 0) % 100000) / 100000
}

export type GlitchCharStyle = {
  fontSize: string
  fontWeight?: 'bold'
  fontStyle?: 'italic'
  display: 'inline-block'
  verticalAlign: 'middle'
  transform?: string
}

// 文字ごとのスタイル（サイズばらつき・たまに斜め・たまに太字）
export function glitchCharStyle(id: string, index: number): GlitchCharStyle {
  // サイズ：0.8em〜1.7em のあいだでばらつく
  const sizeR = seeded(id, index, 1)
  const fontSize = `${(0.8 + sizeR * 0.9).toFixed(2)}em`

  // 斜め：おおよそ 15 文字に 1 文字（強制的に index%15===0 でも傾ける）
  const italic = index % 15 === 0 || seeded(id, index, 2) > 0.92
  // 太字：おおよそ 8 文字に 1 文字くらい
  const bold = seeded(id, index, 3) > 0.8

  // 傾き角度（斜めのときだけ）。左右どちらにも傾く
  const tilt = italic ? (seeded(id, index, 4) * 16 - 8).toFixed(1) : null

  return {
    fontSize,
    display: 'inline-block',
    verticalAlign: 'middle',
    ...(bold ? { fontWeight: 'bold' as const } : {}),
    ...(italic ? { fontStyle: 'italic' as const } : {}),
    ...(tilt ? { transform: `rotate(${tilt}deg)` } : {}),
  }
}

// タイピング速度（標準 charInterval を基準に、速い〜遅いをランダムに返す）。
// factor<1=速い（最速2倍=0.5）, 1=普通, factor>1=遅い
const SPEED_FACTORS = [0.5, 0.65, 0.8, 1, 1.4, 2, 2.6]
export function glitchCharPause(id: string, index: number, baseInterval: number): number {
  // たまに（約8%）長く止まる
  if (seeded(id, index, 6) > 0.92) {
    return 500 + Math.round(seeded(id, index, 7) * 600)  // 500〜1100ms の停止
  }
  const r = seeded(id, index, 5)
  const factor = SPEED_FACTORS[Math.floor(r * SPEED_FACTORS.length)]
  return Math.max(1, Math.round(baseInterval * factor))
}
