// ファイルを扱うためのモジュール.
const fs = require('fs');
// タスク定義.
const Task = require('./task.js');

// データ管理ファイル.
const DATA_FILE = `${__dirname}/tasks.json`;


// データ取得処理.
function getData() {
    try {
        // データを取りだす.
        const dataJSON = fs.readFileSync(DATA_FILE, 'utf-8');
        // JSONのデータをJavascriptのオブジェクトに変換.
        const data = JSON.parse(dataJSON);
        // データの整合性チェック.
        if (!checkData(data)) {
            console.warn('保存されているデータが不正です.');
            return []; // 空の配列を返す.
        }
        // タスククラスに変換.
        data.forEach(task => {
            Object.setPrototypeOf(task, Task.prototype);
        });
        // データを返す.
        return data;
    } catch (err) {
        // デバック用.
        // console.error(err);

        // ファイル未作成の場合.
        if(err.code === 'ENOENT') {
            // データを初期化する.
            console.warn('データファイルが存在しません.');
            return []; // 空の配列を返す.
        }

        throw new Error('データの取得に失敗しました.');
    }
}

// データ保存処理.
function saveData(data) {
    try {
        // タスクのデータは tasks.json ファイルに保存する.
        fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    } catch (err) {
        // デバック用.
        // console.error(err);

        throw new Error('データの保存に失敗しました.');
    }
}

// データチェック処理.
function checkData(data) {
    // データが配列かチェック.
    if (!Array.isArray(data)) return false;
    // ※「中身がTaskか」の判定は、変換後instanceofでできなさそうなので未実施.
    for (let task of data) {
        // 各フィールドの型チェック.
        if (typeof task.id !== 'string') return false;
        if (typeof task.createdAt !== 'string') return false;
        if (typeof task.title !== 'string') return false;
        if (typeof task.completed !== 'boolean') return false;
    }
    return true;
}

module.exports = {
    getData: getData,
    saveData: saveData,
    checkData: checkData
}