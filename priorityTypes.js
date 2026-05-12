// 優先度は high / medium / low の3段階.
const PRIORITY_CONFIGS = Object.freeze({
  high: Object.freeze({ color: 'red' }),
  medium: Object.freeze({ color: 'yellow' }),
  low: Object.freeze({ color: 'white' }),
});

// 優先度の種別一覧. ※キーが二重定義にならないよう、PRIORITY_CONFIGSから取得.
const LEVELS = Object.freeze(Object.keys(PRIORITY_CONFIGS));

// 優先度に応じたchalk関数の色名を取得する.
function getChalkColorName(level) {
  return PRIORITY_CONFIGS[level]?.color ?? 'yellow';
}

module.exports = {
  LEVELS: LEVELS,
  getChalkColorName: getChalkColorName,
};
