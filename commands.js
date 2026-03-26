// ターミナル出力の色付け.
const chalk = require('chalk');
// tasks.jsonの読み書き.
const fileManager = require('./fileManager.js');


// タスク追加処理.
function addTask(task) {
    // データ取得.
    const taskList = fileManager.getData();
    // データを追加.
    taskList.push(task);
    // データを保存.
    fileManager.saveData(taskList);
}

// タスク表示処理.
function viewTaskList() {
    // データ取得.
    const taskList = fileManager.getData();
    // データの件数チェック.
    if (taskList.length) {
        // 存在する場合、データを表示.
        taskList.forEach(task => {
            // 完了状態によって色を分ける.
            if (task.completed) {
                // 完了タスクはグレー.
                console.log(chalk.gray(getText(task)));
            } else {
                // 未完了タスクは白色.
                console.log(chalk.white(getText(task)));
            }
        });
    } else {
        // データが存在しない場合.
        console.log('登録されているタスクはありません.');
    }

    // タスク表示のテキスト取得.
    function getText(task) {
        return `ID: ${task.id}, タイトル: ${task.title}, 作成日時: ${task.createdAt}, 完了状態: ${task.getStatus()}`;
    }
}

// タスク更新処理.
function updateTask(id) {
    // データ取得.
    const taskList = fileManager.getData();
    // 対象を初期化.
    let target = null;
    // 対象のタスクを更新、取得.
    for (let task of taskList) {
        if (task.id === id) {
            if (task.completed) throw new Error('指定のタスクはすでに完了になっています.');
            task.completed = true;
            target = task;
            break;
        }
    }
    // 対象の存在チェック.
    if (target) {
        // 存在する場合、データを保存.
        fileManager.saveData(taskList);
        return target;
    } else {
        // 存在しない場合、エラーを投げる.
        throw new Error('指定のIDに該当するタスクが存在しません.');
    }
}

// タスク削除処理.
function deleteTask(id) {
    // データ取得.
    const taskList = fileManager.getData();
    // 対象のインデックスを取得.
    let index = taskList.findIndex(task => task.id === id);
    // 対象の存在チェック.
    if (index >= 0) {
        // 存在する場合、一覧からデータを削除.
        const target = taskList.splice(index, 1).shift();
        fileManager.saveData(taskList);
        return target;
    } else {
        // 存在しない場合、エラーを投げる.
        throw new Error('指定のIDに該当するタスクが存在しません.');
    }
}

module.exports = {
    addTask: addTask,
    viewTaskList: viewTaskList,
    updateTask: updateTask,
    deleteTask: deleteTask
}