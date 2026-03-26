// ファイルを扱うためのモジュール.
const fs = require('fs');
// 日時のフォーマット.
const dayjs = require('dayjs');
// タスク定義.
const Task = require('./task.js');

// データ管理ファイル.
const DATA_FILE = 'tasks.json';
// DATA_FILEの初期値.
const EMPTY_DATA = [];
// データバックアップディレクトリ.
const BACKUP_DIR = './backups';


// データ取得処理.
function getData() {
    try {
        // データを取りだす.
        const dataJSON = fs.readFileSync(DATA_FILE);
        // JSONのデータをJavascriptのオブジェクトに変換.
        const data = JSON.parse(dataJSON);
        // データの整合性チェック.
        if (!checkData(data)) {
            console.warn('保存されているデータが不正です.');
            return initializeData();
        }
        // タスククラスに変換.
        data.forEach(task => {
            Object.setPrototypeOf(task, Task.prototype);
        });
        // データを返す.
        return data;
    } catch (err) {
        // デバック用.
        console.error(err);

        console.warn('データの取得に失敗しました.');
        return initializeData();
    }
}

// データ保存処理.
function saveData(data) {
    try {
        // タスクのデータは tasks.json ファイルに保存する.
        fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    } catch (err) {
        // デバック用.
        console.error(err);

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

// データ初期化処理.
function initializeData() {
    // バックアップを作成.
    backupData();

    // 空の配列で初期化.
    saveData(EMPTY_DATA);
    console.warn('データを初期化しました.');
    return EMPTY_DATA;
}

// データバックアップ処理.
function backupData() {
    try {
        // データファイル存在チェック.
        if (!fs.existsSync(DATA_FILE)) return;
        // バックアップディレクトリの存在チェック、作成.
        if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);
        // ファイルをコピーする.
        const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
        const fileName = `tasks_backup_${timestamp}.json`;
        fs.copyFileSync(DATA_FILE, `${BACKUP_DIR}/${fileName}`);
        console.warn(`データのバックアップを作成しました. :${BACKUP_DIR}/${fileName}`);
    } catch (err) {
        throw new Error('バックアップの作成に失敗しました.');
    }
}

module.exports = {
    getData: getData,
    saveData: saveData,
    checkData: checkData,
    initializeData: initializeData,
    backupData: backupData
}