// 異変がない時に指摘した場合に表示する編集コメント（全段階共通）
const NO_ANOMALY_COMMENT = '問題ありません。執筆をつづけてください。'

export const editorComments: Record<string, string[]> = {
  'stage-1': [NO_ANOMALY_COMMENT],
  'stage-2': [NO_ANOMALY_COMMENT],
  'stage-3': [NO_ANOMALY_COMMENT],
  'stage-4': [NO_ANOMALY_COMMENT],
  'stage-5': [NO_ANOMALY_COMMENT],
  'stage-6': [NO_ANOMALY_COMMENT],
  'stage-7': [NO_ANOMALY_COMMENT],
  'stage-8': [NO_ANOMALY_COMMENT],
}

// 異変なし指摘時の作者返信プール（段階別）
export const noAnomalyReplies: Record<string, string[]> = {
  'stage-1': [
    'え？ ここも違いましたか。',
    'ちゃんと書けていたと思ったんですが。',
    'すみません。もう一度書きます。',
  ],
  'stage-2': [
    'え？ ここも違いましたか。',
    'すみません。もう一度書きます。',
    'ちゃんと書けていたと思ったんですが。',
  ],
  'stage-3': [
    'ありがとうございます。続けます。',
    'ここまで戻れば大丈夫ですか。',
    'すみません。もう一度書きます。',
  ],
  'stage-4': [
    'ここまで戻れば大丈夫ですか。',
    'また、戻るんですね。',
    '……今、何を書いていましたっけ。',
  ],
  'stage-5': [
    'また、戻るんですね。',
    '……今、何を書いていましたっけ。',
    'ここまで戻れば大丈夫ですか。',
  ],
  'stage-6': [
    '何回同じところを書かせるんですか。',
    'また、戻るんですね。',
    'ここまで戻れば大丈夫ですか。',
  ],
  'stage-7': [
    '正常って誰が決めたんですか。',
    'ここまでは正常ですか。',
    '直せば直すほど、私の方がおかしくなる。',
  ],
  'stage-8': [
    'また戻るんですね。',
    '読んでいるなら返事をしてください。',
    'ここまでは正常ですか。',
  ],
}
