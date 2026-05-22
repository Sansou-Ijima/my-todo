/**
 * 対象のオブジェクトを再起的にフリーズします.
 * @param {object} target 対象オブジェクト.
 * @returns {object} フリーズしたオブジェクト.
 */
function deepFreeze(target) {
  Object.values(target).forEach((value) => {
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  });

  return Object.freeze(target);
}

// 優先度は high / medium / low の3段階.
const PRIORITY_CONFIGS = deepFreeze({
  high: { color: 'red' },
  medium: { color: 'yellow' },
  low: { color: 'white' },
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
