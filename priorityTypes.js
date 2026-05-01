// 優先度は high / medium / low の3段階.
const PRIORITIES = {
  high: { color: "red" },
  medium: { color: "yellow" },
  low: { color: "white" },
};

// 優先度の種別一覧. ※キーが二重定義にならないよう、PRIORITIESから取得.
const PRIORITY_TYPES = Object.keys(PRIORITIES);

module.exports = {
  PRIORITIES: PRIORITIES,
  PRIORITY_TYPES: PRIORITY_TYPES,
};
