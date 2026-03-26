// 一意なIDの生成.
const { v4: uuidv4 } = require('uuid');
// 日時のフォーマット.
const dayjs = require('dayjs');


// タスク.
class Task {
    constructor(title) {
        // バリデーション.
        this.#validate(title);

        // ID: uuid で生成した一意のIDを付与.
        this.id = uuidv4();
        // 作成日時: dayjs で YYYY-MM-DD HH:mm 形式にして保存する.
        this.createdAt = dayjs().format('YYYY-MM-DD HH:mm');
        // タイトル: 引数で受け取ったタイトルを設定する.
        this.title = title;
        // 完了状態.
        this.completed = false;
    }

    // 初期化時の入力チェック処理.
    #validate(title) {
        // タイトルの入力チェック.
        if (!title || !title.match(/\S/g)) throw new Error('タイトルを入力してください.');
        // ※必要に応じて最大文字数チェック.
    }

    // 完了状態から、タスクの状態を文字列で取得する.
    getStatus() {
        return this.completed ? '完了' : '未完了';
    }
}


module.exports = Task;