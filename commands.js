// 一意なIDの生成.
const { v4: uuidv4 } = require('uuid');
// 日時のフォーマット.
const dayjs = require('dayjs');
// tasks.jsonの読み書き.
const fileManager = require('./fileManager.js');

/**
 * 新規タスクを作成します.
 * @param {string} title タスクのタイトル.
 * @param {string} priority タスクの優先度.
 * @returns {object} 作成したタスク.
 */
function createTask(title, priority) {
  return {
    // ID: uuid で生成した一意のIDを付与.
    id: uuidv4(),
    // 作成日時: dayjs で YYYY-MM-DD HH:mm 形式にして保存する.
    createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
    // タイトル: 引数で受け取ったタイトルを設定する.
    title: title,
    // 完了状態: デフォルトでfalse（未完了）を設定.
    completed: false,
    // 優先度: 引数で受け取った優先度を設定する.
    priority: priority,
  };
}

/**
 * タスク一覧の取得結果を作成します.
 * @param {object} taskList タスク一覧.
 * @param {function} filterFunc フィルター関数.
 * @param {string} filterType フィルター種別.
 * @returns {object} タスク一覧の取得結果.
 */
function createTaskListResult(taskList, filterFunc, filterType) {
  return {
    // 絞り込み後のタスク一覧.
    tasks: taskList.filter(filterFunc),
    // 登録されているタスクの総数.
    totalCount: taskList.length,
    // フィルター種別.
    filterType: filterType,
  };
}

/**
 * タスク一覧から統計を作成します.
 * @param {object} taskList タスク一覧.
 * @returns {object} 統計.
 */
function createStatus(taskList) {
  // 全タスク数.
  const total = taskList.length;
  // 完了タスク数.
  const completed = taskList.filter((task) => task.completed).length;
  // 未完了タスク数.
  const notCompleted = taskList.filter((task) => !task.completed).length;
  // 完了率（パーセンテージ）.
  const completedRate = total === 0 ? 0 : ((completed / total) * 100).toFixed(1);
  // 直近7日以内に作成されたタスクの件数（dayjs を使って判定する）.
  const isWithin7Days = (task) => dayjs(task.createdAt).isAfter(dayjs().subtract(7, 'day'));
  const recent = taskList.filter((task) => isWithin7Days(task)).length;

  return { total, completed, notCompleted, completedRate, recent };
}

/**
 * 新規タスクを作成し、データを保存します.
 * @param {string} title タスクのタイトル.
 * @param {string} priority タスクの優先度.
 * @returns {object} 追加したタスク.
 */
function addTask(title, priority) {
  if (!title || !title.match(/\S/g)) throw new Error('タイトルを入力してください.');

  const taskList = fileManager.getData();

  const task = createTask(title, priority);

  taskList.push(task);

  fileManager.saveData(taskList);

  return task;
}

/**
 * オプションによってフィルターされた、タスク一覧を返します.
 * @param {object} options オプション.
 * @returns {object} タスク一覧.
 */
function getTaskList(options) {
  const taskList = fileManager.getData();

  // フィルター条件.
  const getFilterFunc = (options) => {
    // 完了タスクのみを表示する.
    if (options.done) return (task) => task.completed;
    // 未完了タスクのみを表示する.
    if (options.todo) return (task) => !task.completed;
    // 全件表示する.
    return () => true;
  };

  // フィルター種別.
  const getFilterType = (options) => {
    if (options.done) return 'done';
    if (options.todo) return 'todo';
    return 'all';
  };

  return createTaskListResult(taskList, getFilterFunc(options), getFilterType(options));
}

/**
 * 検索テキストに該当する、タスク一覧を返します.
 * @param {string} text 検索テキスト.
 * @returns {object} タスク一覧.
 */
function searchTask(text) {
  if (!text.trim()) throw new Error('テキストを入力してください.');

  const taskList = fileManager.getData();

  return createTaskListResult(taskList, (task) => task.title.includes(text), 'search');
}

/**
 * 統計を返します.
 * @returns {object} 統計.
 */
function getStats() {
  const taskList = fileManager.getData();

  return createStatus(taskList);
}

/**
 * 指定のタスクを完了状態に更新します.
 * @param {string} id タスクのID.
 * @returns {object} 更新したタスク.
 */
function updateTask(id) {
  const taskList = fileManager.getData();

  const target = taskList.find((task) => task.id === id);

  if (!target) throw new Error('指定のIDに該当するタスクが存在しません.');

  if (target.completed) throw new Error('指定のタスクはすでに完了になっています.');

  target.completed = true;

  fileManager.saveData(taskList);

  return target;
}

/**
 * 指定のタスクを削除します.
 * @param {string} id タスクのID.
 * @returns {object} 削除したタスク.
 */
function deleteTask(id) {
  const taskList = fileManager.getData();

  const index = taskList.findIndex((task) => task.id === id);

  if (index < 0) throw new Error('指定のIDに該当するタスクが存在しません.');

  const target = taskList.splice(index, 1).shift();

  fileManager.saveData(taskList);

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
