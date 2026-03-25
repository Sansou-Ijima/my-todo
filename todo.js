// コマンドライン引数の解析.
const commander = require('commander');
const program = new commander.Command();
// 一意なIDの生成.
const { v4: uuidv4 } = require('uuid');
// 日時のフォーマット.
const dayjs = require('dayjs');
// ファイルを扱うためのモジュール.
const fs = require('fs');
// ターミナル出力の色付け.
const chalk = require('chalk');

// データ管理ファイル.
const DATA_FILE = 'tasks.json';
// DATA_FILEの初期値.
const EMPTY_DATA = [];
// データバックアップディレクトリ.
const BACKUP_DIR = './backups';

// タスク.
class Task {
  constructor(content) {
    // バリデーション.
    this.#validate(content);

    // ID: uuid で生成した一意のIDを付与.
    this.id = uuidv4();
    // 作成日時: dayjs で YYYY-MM-DD HH:mm 形式にして保存する.
    this.createdAt = dayjs().format('YYYY-MM-DD HH:mm');
    // タスクの内容: 引数で受け取った内容を設定する.
    this.content = content;
  }

  // 初期化時の入力チェック処理.
  #validate(content) {
    // タスク内容の入力チェック.
    if(!content || !content.match(/\S/g)) throw new Error('タスクの内容を入力してください.');
    // ※必要に応じて最大文字数チェック.
  }
}


// タスク追加処理.
function addTask(task) {
  // データ取得.
  const taskList = getData();
  // データを追加.
  taskList.push(task);
  // データを保存.
  saveData(taskList);
}


// データ取得処理.
function getData() {
  try {
    // データを取りだす.
    const dataJSON = fs.readFileSync(DATA_FILE);
    // JSONのデータをJavascriptのオブジェクトに変換.
    const data = JSON.parse(dataJSON);
    // データの整合性チェック.
    if(!checkData(data)) {
      console.warn('保存されているデータが不正です.');
      return initializeData();
    }
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


// add コマンド.
program
  .command('add')
  .argument('<content>', 'String argument')
  .action((content) => {
    try {
      // タスクを作成.
      const task = new Task(content);
      // タスク追加処理.
      addTask(task);
      // 追加完了メッセージを chalk の緑色で表示する.
      console.log(chalk.green(`タスクを追加しました. ID: ${task.id}, タスクの内容: ${task.content}`));
    } catch (err) {
      console.error(err.message);
    }
  });


// process.argv を解析し、Electron および特別な Node.js フラグを自動検出.
program.parse();