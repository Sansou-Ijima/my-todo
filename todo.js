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
    if(!title || !title.match(/\S/g)) throw new Error('タイトルを入力してください.');
    // ※必要に応じて最大文字数チェック.
  }

  // 完了状態から、タスクの状態を文字列で取得する.
  getStatus() {
    return this.completed ? '完了' : '未完了';
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

// タスク表示処理.
function viewTaskList() {
  // データ取得.
  const taskList = getData();
  // データの件数チェック.
  if(taskList.length) {
    // 存在する場合、データを表示.
    taskList.forEach(task => {
      // 完了状態によって色を分ける.
      if(task.completed) {
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
  const taskList = getData();
  // 対象を初期化.
  let target = null;
  // 対象のタスクを更新、取得.
  for(let task of taskList) {
    if(task.id === id) {
      if(task.completed) throw new Error('指定のタスクはすでに完了になっています.');
      task.completed = true;
      target = task;
      break;
    }
  }
  // 対象の存在チェック.
  if(target) {
    // 存在する場合、データを保存.
    saveData(taskList);
    return target;
  } else {
    // 存在しない場合、エラーを投げる.
    throw new Error('指定のIDに該当するタスクが存在しません.');
  }
}

// タスク削除処理.
function deleteTask(id) {
  // データ取得.
  const taskList = getData();
  // 対象のインデックスを取得.
  let index = taskList.findIndex(task => task.id === id);
  // 対象の存在チェック.
  if(index >= 0) {
    // 存在する場合、一覧からデータを削除.
    const target = taskList.splice(index, 1).shift();
    saveData(taskList);
    return target;
  } else {
    // 存在しない場合、エラーを投げる.
    throw new Error('指定のIDに該当するタスクが存在しません.');
  }
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
    if(typeof task.id !== 'string') return false;
    if(typeof task.createdAt !== 'string') return false;
    if(typeof task.title !== 'string') return false;
    if(typeof task.completed !== 'boolean') return false;
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


// add コマンド.
program
  .command('add')
  .argument('<title>', 'String argument')
  .action((title) => {
    try {
      // タスクを作成.
      const task = new Task(title);
      // タスク追加処理.
      addTask(task);
      // 追加完了メッセージを chalk の緑色で表示する.
      console.log(chalk.green(`タスクを追加しました. ID: ${task.id}, タイトル: ${task.title}`));
    } catch (err) {
      console.error(chalk.red(err.message));
    }
  });

// list コマンド.
program
  .command('list')
  .action(() => {
    try {
      // タスク表示処理.
      viewTaskList();
    } catch (err) {
      console.error(chalk.red(err.message));
    }
  });

// done コマンド.
program
  .command('done')
  .argument('<id>', 'String argument')
  .action((id) => {
    try {
      // タスク更新処理.
       const target = updateTask(id);
      // 追加完了メッセージを chalk の緑色で表示する.
      console.log(chalk.green(`タスクを完了にしました. ID: ${target.id}, タイトル: ${target.title}`));
    } catch (err) {
      console.error(chalk.red(err.message));
    }
  });

// delete コマンド.
program
  .command('delete')
  .argument('<id>', 'String argument')
  .action((id) => {
    try {
      // タスク更新処理.
       const target = deleteTask(id);
      // 削除完了メッセージを chalk の緑色で表示する.
      console.log(chalk.green(`タスクを削除しました. ID: ${target.id}, タイトル: ${target.title}`));
    } catch (err) {
      console.error(chalk.red(err.message));
    }
  });

// process.argv を解析し、Electron および特別な Node.js フラグを自動検出.
program.parse();