// 一意なIDの生成.
const { v4: uuidv4 } = require("uuid");
// 日時のフォーマット.
const dayjs = require("dayjs");
// tasks.jsonの読み書き.
const fileManager = require("./fileManager.js");

// タスクを作成する.
function createTask(title, priority) {
  return {
    // ID: uuid で生成した一意のIDを付与.
    id: uuidv4(),
    // 作成日時: dayjs で YYYY-MM-DD HH:mm 形式にして保存する.
    createdAt: dayjs().format("YYYY-MM-DD HH:mm"),
    // タイトル: 引数で受け取ったタイトルを設定する.
    title: title,
    // 完了状態: デフォルトでfalse（未完了）を設定.
    completed: false,
    // 優先度: 引数で受け取った優先度を設定する.
    priority: priority,
  };
}

// タスク一覧から統計を作成する.
function createStatus(taskList) {
  // 全タスク数.
  const total = taskList.length;
  // 完了タスク数.
  const completed = taskList.filter((task) => task.completed).length;
  // 未完了タスク数.
  const notCompleted = taskList.filter((task) => !task.completed).length;
  // 完了率（パーセンテージ）.
  const completedRate =
    total === 0 ? 0 : ((completed / total) * 100).toFixed(1);
  // 直近7日以内に作成されたタスクの件数（dayjs を使って判定する）.
  const isWithin7Days = (task) =>
    dayjs(task.createdAt).isAfter(dayjs().subtract(7, "day"));
  const recent = taskList.filter((task) => isWithin7Days(task)).length;

  // 統計を返す.
  return { total, completed, notCompleted, completedRate, recent };
}

// タスク追加処理.
function addTask(title, priority) {
  // タイトルの入力チェック.
  if (!title || !title.match(/\S/g))
    throw new Error("タイトルを入力してください.");

  // データ取得.
  const taskList = fileManager.getData();

  // タスクを作成.
  const task = createTask(title, priority);
  // データを追加.
  taskList.push(task);

  // データを保存.
  fileManager.saveData(taskList);

  // 追加したタスクを返す.
  return task;
}

// タスク一覧取得処理.
function getTaskList(options) {
  // フィルター条件.
  const getFilterFunc = (options) => {
    // 完了タスクのみを表示する.
    if (options.done) return (task) => task.completed;
    // 未完了タスクのみを表示する.
    if (options.todo) return (task) => !task.completed;
    // 全件表示する.
    return () => true;
  };

  // データを取得し、フィルターして返す.
  return fileManager.getData().filter(getFilterFunc(options));
}

// タスク検索処理.
function searchTask(text) {
  // テキストの入力チェック.
  if (!text.trim()) throw new Error("テキストを入力してください.");

  // データを取得し、フィルターして返す.
  return fileManager.getData().filter((task) => task.title.includes(text));
}

// 統計取得処理.
function getStats() {
  // データ取得.
  const taskList = fileManager.getData();
  // 統計を作成して返す.
  return createStatus(taskList);
}

// タスク更新処理.
function updateTask(id) {
  // データ取得.
  const taskList = fileManager.getData();
  // 対象を取得.
  const target = taskList.find((task) => task.id === id);

  // 対象の存在チェック.
  if (!target) throw new Error("指定のIDに該当するタスクが存在しません.");
  // 完了状態のチェック.
  if (target.completed)
    throw new Error("指定のタスクはすでに完了になっています.");

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
  const index = taskList.findIndex((task) => task.id === id);

  // 対象の存在チェック.
  if (index < 0) throw new Error("指定のIDに該当するタスクが存在しません.");

  // 一覧からデータを削除.
  const target = taskList.splice(index, 1).shift();

  // データを保存.
  fileManager.saveData(taskList);

  // 削除したタスクを返す.
  return target;
}

module.exports = {
  addTask: addTask,
  getTaskList: getTaskList,
  searchTask: searchTask,
  getStats: getStats,
  updateTask: updateTask,
  deleteTask: deleteTask,
};
