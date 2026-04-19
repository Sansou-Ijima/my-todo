// ターミナル出力の色付け.
const chalk = require('chalk');


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
    return `タスクを${actionMessage}. ${formatTask(task)}`
}


// タスクの一覧表示処理.
function viewTask(taskList) {
    // データの件数チェック.
    if (taskList.length === 0) {
        console.log('登録されているタスクはありません.');
        return;
    }

    // 優先度に応じたchalk関数.
    const priorityColorMap = {
        'high': chalk.red,
        'medium': chalk.yellow,
        'low': chalk.white
    }
    // 表示色の設定.
    const pickColor = task => task.completed ? chalk.gray : priorityColorMap[task.priority];

    // タスクを表示する.
    taskList.map((task) => pickColor(task)(formatTask(task))).forEach(taskView => console.log(taskView));
}

// 統計の表示処理.
function viewStatus(status) {
    console.log(formatStatus(status));
}

// 完了メッセージの表示処理.
function viewCompleteMessage(task, action) {
    // action毎のメッセージ.
    let actionMessages = {
        'add': '追加しました',
        'done': '完了にしました',
        'delete': '削除しました'
    };
    // 完了メッセージを chalk の緑色で表示する.
    console.log(chalk.green(formatCompleteMessage(actionMessages[action], task)));
}

module.exports = {
    viewTask: viewTask,
    viewStatus: viewStatus,
    viewCompleteMessage: viewCompleteMessage
}