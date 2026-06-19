// 一意なIDの生成.
const { v4: uuidv4 } = require('uuid');
// 日時のフォーマット.
const dayjs = require('dayjs');
// データベース.
const database = require('./database.js');
// フィルター種別一覧.
const filterTypes = require('./filterTypes.js');

/**
 * 新規タスクを作成します.
 * @param {string} title タスクのタイトル.
 * @param {string} priority タスクの優先度.
 * @returns {object} 作成したタスク.
 */
function createTask(title, priority) {
  return {
    id: uuidv4(),
    createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
    title: title,
    completed: false,
    priority: priority,
  };
}

/**
 * タスク一覧の取得結果を作成します.
 * @param {object} taskList 絞り込み後のタスク一覧.
 * @param {string} filterType フィルター種別.
 * @returns {object} タスク一覧の取得結果.
 */
async function createTaskListResult(taskList, filterType) {
  if (!filterTypes.TYPES.includes(filterType)) throw new Error('不正なフィルター種別です.');

  return {
    tasks: taskList,
    totalCount: await database.getTotalCount(),
    filterType: filterType,
  };
}

/**
 * 新規タスクを作成し、データを保存します.
 * @param {string} title タスクのタイトル.
 * @param {string} priority タスクの優先度.
 * @returns {object} 追加したタスク.
 */
async function addTask(title, priority) {
  if (!title || !title.match(/\S/g)) throw new Error('タイトルを入力してください.');

  const task = createTask(title, priority);

  await database.addTask(task);

  return task;
}

/**
 * オプションによってフィルターされた、タスク一覧を返します.
 * @param {object} options オプション.
 * @returns {object} タスク一覧.
 */
async function getTaskList(options) {
  const taskList = await database.getTaskList(options);

  const getFilterType = (options) => {
    if (options.done) return 'done';
    if (options.todo) return 'todo';
    return 'all';
  };

  return createTaskListResult(taskList, getFilterType(options));
}

/**
 * 検索テキストに該当する、タスク一覧を返します.
 * @param {string} text 検索テキスト.
 * @returns {object} タスク一覧.
 */
async function searchTask(text) {
  if (!text.trim()) throw new Error('テキストを入力してください.');

  const taskList = await database.searchTask(text);

  return createTaskListResult(taskList, 'search');
}

/**
 * 統計を返します.
 * @returns {object} 統計.
 */
async function getStats() {
  const stats = await database.getStats();
  return {
    total: stats.total,
    completed: stats.completed,
    notCompleted: stats.notCompleted,
    completedRate: stats.total === 0 ? 0 : ((stats.completed / stats.total) * 100).toFixed(1),
    recent: stats.recent,
  };
}

/**
 * 指定のタスクを完了状態に更新します.
 * @param {string} id タスクのID.
 * @returns {object} 更新したタスク.
 */
async function updateTask(id) {
  const target = await database.getTaskById(id);

  if (!target) throw new Error('指定のIDに該当するタスクが存在しません.');

  if (target.completed) throw new Error('指定のタスクはすでに完了になっています.');

  await database.updateTask(id);

  target.completed = true;

  return target;
}

/**
 * 指定のタスクを削除します.
 * @param {string} id タスクのID.
 * @returns {object} 削除したタスク.
 */
async function deleteTask(id) {
  const target = await database.getTaskById(id);

  if (!target) throw new Error('指定のIDに該当するタスクが存在しません.');

  await database.deleteTask(id);

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
