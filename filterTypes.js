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

// フィルター種別は all / done / todo / search の4種類.
const FILTER_CONFIGS = deepFreeze({
  all: {},
  done: { emptyMessage: '完了済みのタスクはありません.' },
  todo: { emptyMessage: '未完了のタスクはありません.' },
  search: { emptyMessage: '検索条件に該当するタスクはありません.' },
});

// フィルター種別一覧. ※キーが二重定義にならないよう、FILTER_CONFIGSから取得.
const TYPES = Object.freeze(Object.keys(FILTER_CONFIGS));

// 表示するタスクが存在しない場合の表示メッセージを取得する.
function getEmptyMessage(taskListResult) {
  // 登録されているタスクが存在しない場合.
  if (taskListResult.totalCount === 0) return '登録されているタスクはありません.';
  // 登録されているタスクは存在するが、フィルター条件に該当するタスクが存在しない場合.
  return FILTER_CONFIGS[taskListResult.filterType]?.emptyMessage ?? '該当するタスクはありません.';
}

module.exports = {
  TYPES: TYPES,
  getEmptyMessage: getEmptyMessage,
};
