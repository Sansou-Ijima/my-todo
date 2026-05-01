// ターミナル出力の色付け.
const chalk = require("chalk");
// 優先度の種別一覧.
const { PRIORITIES } = require("./priorityTypes.js");

// タスク表示内容のフォーマット.
function formatTask(task) {
  return `ID: ${task.id}, タイトル: ${task.title}, 作成日時: ${task.createdAt}, 完了状態: ${task.completed ? "完了" : "未完了"}, 優先度: ${task.priority}`;
}

// 統計表示内容のフォーマット.
function formatStatus(status) {
  return `全タスク数: ${status.total}, 完了タスク数: ${status.completed}, 未完了タスク数: ${status.notCompleted}, 完了率: ${status.completedRate}%, 直近7日以内に作成されたタスクの件数: ${status.recent}`;
}

// 完了メッセージのフォーマット.
function formatCompleteMessage(actionMessage, task) {
  return `タスクを${actionMessage}. ${formatTask(task)}`;
}

// タスクの一覧表示処理.
function viewTask(taskList, action) {
  // データの件数チェック.
  if (taskList.length === 0) {
    // action毎のメッセージ設定.
    const actionMessages = {
      list: "登録されているタスクはありません.",
      search: "検索条件に該当するタスクはありません.",
    };
    console.log(actionMessages[action] ?? "該当するタスクはありません.");
    return;
  }

  // 優先度に応じたchalk関数.
  const priorityColor = (task) => chalk[PRIORITIES[task.priority].color];
  // 表示色の設定.
  const pickColor = (task) =>
    task.completed ? chalk.gray : (priorityColor(task) ?? chalk.yellow);

  // タスクを表示する.
  taskList
    .map((task) => pickColor(task)(formatTask(task)))
    .forEach((taskView) => console.log(taskView));
}

// 統計の表示処理.
function viewStatus(status) {
  console.log(formatStatus(status));
}

// 完了メッセージの表示処理.
function viewCompleteMessage(task, action) {
  // action毎のメッセージ設定.
  const actionMessages = {
    add: { message: "追加しました", color: chalk.green },
    done: { message: "完了にしました", color: chalk.green },
    delete: { message: "削除しました", color: chalk.yellow },
  };
  // 指定アクションの設定を取得.
  const messageSetting = actionMessages[action];
  // 完了メッセージを表示する.
  console.log(
    messageSetting.color(formatCompleteMessage(messageSetting.message, task)),
  );
}

module.exports = {
  viewTask: viewTask,
  viewStatus: viewStatus,
  viewCompleteMessage: viewCompleteMessage,
};
