// ターミナル出力の色付け.
const chalk = require('chalk');
// 優先度に応じた色名取得関数.
const priorities = require('./priorityTypes.js');

// タスク表示内容のフォーマット.
function formatTask(task) {
  return `ID: ${task.id}, タイトル: ${task.title}, 作成日時: ${task.createdAt}, 完了状態: ${task.completed ? '完了' : '未完了'}, 優先度: ${task.priority}`;
}

// 統計表示内容のフォーマット.
function formatStatus(status) {
  return `全タスク数: ${status.total}, 完了タスク数: ${status.completed}, 未完了タスク数: ${status.notCompleted}, 完了率: ${status.completedRate}%, 直近7日以内に作成されたタスクの件数: ${status.recent}`;
}

// 完了メッセージのフォーマット.
function formatCompleteMessage(actionMessage, task) {
  return `タスクを${actionMessage}. ${formatTask(task)}`;
}

/**
 * 表示するタスクが存在しない場合の表示メッセージを返します.
 * @param {object} taskListResult タスク一覧の取得結果.
 * @returns {string} 表示するタスクが存在しない場合の表示メッセージ.
 */
function getEmptyTaskMessage(taskListResult) {
  // 登録されているタスクが存在しない場合.
  if (taskListResult.totalCount === 0) return '登録されているタスクはありません.';

  // 登録されているタスクは存在するが、フィルター条件に該当するタスクが存在しない場合.
  const filterMessages = {
    done: '完了済みのタスクはありません.',
    todo: '未完了のタスクはありません.',
    search: '検索条件に該当するタスクはありません.',
  };
  return filterMessages[taskListResult.filterType] ?? '該当するタスクはありません.';
}

/**
 * タスク一覧を表示します.
 * @param {object} taskListResult タスク一覧.
 */
function outputTask(taskListResult) {
  // 表示するタスクが 0件 の場合.
  if (taskListResult.tasks.length === 0) {
    console.log(getEmptyTaskMessage(taskListResult));
    return;
  }

  // 優先度に応じたchalk関数.
  const priorityColor = (task) => chalk[priorities.getChalkColorName(task.priority)];
  // 表示色の設定.
  const pickColor = (task) => (task.completed ? chalk.gray : priorityColor(task));

  taskListResult.tasks
    .map((task) => pickColor(task)(formatTask(task)))
    .forEach((formattedTask) => console.log(formattedTask));
}

/**
 * 統計を表示します.
 * @param {object} status 統計.
 */
function outputStatus(status) {
  console.log(formatStatus(status));
}

/**
 * 完了メッセージを表示します.
 * @param {object} task タスク.
 * @param {string} action アクション.
 */
function outputCompleteMessage(task, action) {
  // action毎のメッセージ設定.
  const actionMessages = {
    add: { message: '追加しました', color: chalk.green },
    done: { message: '完了にしました', color: chalk.green },
    delete: { message: '削除しました', color: chalk.yellow },
  };

  const messageSetting = actionMessages[action];

  console.log(messageSetting.color(formatCompleteMessage(messageSetting.message, task)));
}

module.exports = {
  outputTask: outputTask,
  outputStatus: outputStatus,
  outputCompleteMessage: outputCompleteMessage,
};
