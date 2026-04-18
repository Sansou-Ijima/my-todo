// 一意なIDの生成.
const { v4: uuidv4 } = require('uuid');
// 日時のフォーマット.
const dayjs = require('dayjs');
// ターミナル出力の色付け.
const chalk = require('chalk');
// tasks.jsonの読み書き.
const fileManager = require('./fileManager.js');


// タスク追加処理.
function addTask(title, priority) {
    // タイトルの入力チェック.
    if (!title || !title.match(/\S/g)) throw new Error('タイトルを入力してください.');
    // データ取得.
    const taskList = fileManager.getData();
    // タスクを作成.
    const task = {
        // ID: uuid で生成した一意のIDを付与.
        id: uuidv4(),
        // 作成日時: dayjs で YYYY-MM-DD HH:mm 形式にして保存する.
        createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
        // タイトル: 引数で受け取ったタイトルを設定する.
        title: title,
        // 完了状態: デフォルトでfalse（未完了）を設定.
        completed: false,
        // 優先度: 引数で受け取った優先度を設定する.
        priority: priority
    }
    // データを追加.
    taskList.push(task);
    // データを保存.
    fileManager.saveData(taskList);
    // 追加したタスクを返す.
    return task;
}

// タスク表示処理.
function viewTaskList(options) {
    // フィルター条件.
    const filterType = (options) => {
        // 完了タスクのみを表示する.
        if (options.done) return task => task.completed;
        // 未完了タスクのみを表示する.
        if (options.todo) return task => !task.completed;
        // 全件表示する.
        return () => true;
    }
    // データ取得.
    const taskList = fileManager.getData().filter(filterType(options));
    // データの件数チェック.
    if (taskList.length === 0) {
        console.log('登録されているタスクはありません.');
        return;
    }
    // 表示内容のフォーマット.
    const formatTask = (task) => `ID: ${task.id}, タイトル: ${task.title}, 作成日時: ${task.createdAt}, 完了状態: ${task.completed ? '完了' : '未完了'}, 優先度: ${task.priority}`;
    // 表示色の設定.
    const priorityColorMap = {
        high: chalk.red,
        medium: chalk.yellow,
        low: chalk.white
    }
    const pickColor = (task) => {
        if (task.completed) return chalk.gray;
        return priorityColorMap[task.priority];
    };
    // タスクを表示する.
    taskList.map((task) => pickColor(task)(formatTask(task))).forEach(taskView => console.log(taskView));
}

// タスク検索処理.
function searchTask(text) {
    // データ取得.
    const taskList = fileManager.getData().filter(task => task.title.includes(text));
    // todo: 以下 viewTaskList の処理と共通化.
    // データの件数チェック.
    if (taskList.length === 0) {
        console.log('登録されているタスクはありません.');
        return;
    }
    // 表示内容のフォーマット.
    const formatTask = (task) => `ID: ${task.id}, タイトル: ${task.title}, 作成日時: ${task.createdAt}, 完了状態: ${task.completed ? '完了' : '未完了'}, 優先度: ${task.priority}`;
    // 表示色の設定.
    const pickColor = (task) => (task.completed ? chalk.gray : chalk.white);
    // タスクを表示する.
    taskList.map((task) => pickColor(task)(formatTask(task))).forEach(taskView => console.log(taskView));
}

// 統計表示処理.
function viewStats() {
    // データ取得.
    const taskList = fileManager.getData();
    // 全タスク数.
    const total = taskList.length;
    // 完了タスク数.
    const completed = taskList.filter(task => task.completed).length;
    // 未完了タスク数.
    const notCompleted = taskList.filter(task => !task.completed).length;
    // 完了率（パーセンテージ）.
    const completedRate = total === 0 ? 0 : (completed / total) * 100;
    // 直近7日以内に作成されたタスクの件数（dayjs を使って判定する）.
    const isWithin7Days = (task) => dayjs(task.createdAt).isAfter(dayjs().subtract(7, 'day'));
    const recent = taskList.filter(task => isWithin7Days(task)).length;
    // 統計を表示する.
    console.log(`全タスク数: ${total}, 完了タスク数: ${completed}, 未完了タスク数: ${notCompleted}, 完了率: ${completedRate}%, 直近7日以内に作成されたタスクの件数: ${recent}`)
}

// タスク更新処理.
function updateTask(id) {
    // データ取得.
    const taskList = fileManager.getData();
    // 対象を取得.
    const target = taskList.find(task => task.id === id);
    // 対象の存在チェック.
    if (!target) throw new Error('指定のIDに該当するタスクが存在しません.');
    // 完了状態のチェック.
    if (target.completed) throw new Error('指定のタスクはすでに完了になっています.');
    // 完了状態を変更.
    target.completed = true;
    // データを保存.
    fileManager.saveData(taskList);
    // 更新したタスクを返す.
    return target;
}

// タスク削除処理.
function deleteTask(id) {
    // データ取得.
    const taskList = fileManager.getData();
    // 対象のインデックスを取得.
    const index = taskList.findIndex(task => task.id === id);
    // 対象の存在チェック.
    if (index < 0) throw new Error('指定のIDに該当するタスクが存在しません.');
    // 一覧からデータを削除.
    const target = taskList.splice(index, 1).shift();
    // データを保存.
    fileManager.saveData(taskList);
    // 削除したタスクを返す.
    return target;
}

module.exports = {
    addTask: addTask,
    viewTaskList: viewTaskList,
    searchTask: searchTask,
    viewStats: viewStats,
    updateTask: updateTask,
    deleteTask: deleteTask
}