// ターミナル出力の色付け.
const chalk = require('chalk');
// 優先度に応じた色名取得関数.
const priorities = require('./priorityTypes.js');
// フィルター種別一覧.
const filterTypes = require('./filterTypes.js');

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
 * タスク一覧を表示します.
 * @param {object} taskListResult タスク一覧.
 */
function outputTask(taskListResult) {
  if (taskListResult.tasks.length === 0) {
    console.log(filterTypes.getEmptyMessage(taskListResult));
    return;
  }

  const priorityColor = (task) => chalk[priorities.getChalkColorName(task.priority)];
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
