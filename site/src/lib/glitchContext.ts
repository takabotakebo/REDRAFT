import { createContext, useContext } from 'react'

// 文字化け侵食の進行度（0=なし 〜 1=ほぼ全部化ける）。画面全体で共有する。
export const GlitchContext = createContext(0)
export const useGlitch = () => useContext(GlitchContext)
