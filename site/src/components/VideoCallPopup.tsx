type Props = {
  state: 'none' | 'loading' | 'on' | 'ending'
  frame: 'gif' | 0 | 1 | 2 | 3 | 4 | 'noise'
}

// 「見せろ」連投中に切り替わる5枚の画像（01→05）
const FRAME_IMAGES = [
  'img/01_left_right_violent_blur.png',
  'img/02_lunging_forward_blur.png',
  'img/03_up_down_violent_blur.png',
  'img/04_rotating_broken_blur.png',
  'img/05_multiple_afterimages_blur.png',
]

// 画面右上に固定表示されるビデオ通話風ポップアップ
export function VideoCallPopup({ state, frame }: Props) {
  if (state === 'none') return null

  let screen
  if (state === 'loading') {
    screen = (
      <div className="video-call-loading">
        <div className="video-call-spinner" />
        <span>接続中…</span>
      </div>
    )
  } else if (frame === 'noise') {
    // 黒画面＋ノイズエフェクト
    screen = <div className="video-call-noise" />
  } else if (typeof frame === 'number') {
    screen = <img src={FRAME_IMAGES[frame]} alt="" />
  } else {
    screen = <img src="img/loop.gif" alt="" />
  }

  return (
    <div className={`video-call-popup${state === 'ending' ? ' ending' : ''}`}>
      <div className="video-call-screen">{screen}</div>
      <div className="video-call-bar">
        <span className="video-call-status">{state === 'loading' ? '呼び出し中' : '通話中'}</span>
      </div>
    </div>
  )
}
