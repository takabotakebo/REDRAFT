// ポーズ可能なタイマー基盤。
// pause() 中はすべてのタイマーが凍結し、resume() で「残り時間」から再開する。
// setTimeout / setInterval の代替として after() / every() を提供する。
//
// 仕組み：各タイマーは「あと remaining ミリ秒で発火」という残り時間を持つ。
// 走行中は実 setTimeout で待ち、pause 時にその残り時間を計算して保持、
// resume 時に残り時間で実 setTimeout を貼り直す。これで「時が止まる」を実現する。

type TimerKind = 'timeout' | 'interval'

type ManagedTimer = {
  id: number
  kind: TimerKind
  callback: () => void
  delay: number          // interval の周期 / timeout の元の遅延
  remaining: number      // 次の発火までの残り時間
  startedAt: number      // 現在の実タイマーを開始した時刻（Date.now）
  handle: ReturnType<typeof setTimeout> | null
}

export class PausableClock {
  private timers = new Map<number, ManagedTimer>()
  private nextId = 1
  private paused = false

  get isPaused() {
    return this.paused
  }

  /** setTimeout 相当。返り値は cancel に使う ID。 */
  after(callback: () => void, delay: number): number {
    return this.add('timeout', callback, delay)
  }

  /** setInterval 相当。返り値は cancel に使う ID。 */
  every(callback: () => void, delay: number): number {
    return this.add('interval', callback, delay)
  }

  private add(kind: TimerKind, callback: () => void, delay: number): number {
    const id = this.nextId++
    const timer: ManagedTimer = {
      id,
      kind,
      callback,
      delay,
      remaining: delay,
      startedAt: Date.now(),
      handle: null,
    }
    this.timers.set(id, timer)
    if (!this.paused) this.schedule(timer)
    return id
  }

  private schedule(timer: ManagedTimer) {
    timer.startedAt = Date.now()
    timer.handle = setTimeout(() => this.fire(timer), timer.remaining)
  }

  private fire(timer: ManagedTimer) {
    timer.handle = null
    if (timer.kind === 'interval') {
      // 次の周期をセットしてからコールバック（コールバック内で clear されても整合する）
      timer.remaining = timer.delay
      if (!this.paused) this.schedule(timer)
      timer.callback()
    } else {
      this.timers.delete(timer.id)
      timer.callback()
    }
  }

  /** タイマーを取り消す（setTimeout/clearTimeout の clear 相当）。 */
  clear(id: number | null | undefined) {
    if (id == null) return
    const timer = this.timers.get(id)
    if (!timer) return
    if (timer.handle) clearTimeout(timer.handle)
    this.timers.delete(id)
  }

  /** すべてのタイマーを凍結する。残り時間を保持する。 */
  pause() {
    if (this.paused) return
    this.paused = true
    const now = Date.now()
    for (const timer of this.timers.values()) {
      if (timer.handle) {
        clearTimeout(timer.handle)
        timer.handle = null
        const elapsed = now - timer.startedAt
        timer.remaining = Math.max(0, timer.remaining - elapsed)
      }
    }
  }

  /** 凍結を解除し、各タイマーを残り時間から再開する。 */
  resume() {
    if (!this.paused) return
    this.paused = false
    for (const timer of this.timers.values()) {
      if (timer.handle == null) this.schedule(timer)
    }
  }

  /** すべてのタイマーを破棄する（ステージ切替・リセット時）。 */
  clearAll() {
    for (const timer of this.timers.values()) {
      if (timer.handle) clearTimeout(timer.handle)
    }
    this.timers.clear()
  }
}

// アプリ全体で共有する単一インスタンス
export const clock = new PausableClock()
