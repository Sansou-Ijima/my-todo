const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(`${__dirname}/todos.db`);

/**
 * DB操作をPromiseとして実行します.
 * @param {string} operation 操作.
 * @param {string} query クエリ.
 * @param {array} params パラメータ.
 * @returns {Promise} 操作毎の結果.
 * ※run：{lastID: number, changes: number}
 * ※get：object|undefined
 * ※all：object[]
 */
function accessDatabase(operation, query, params) {
  return new Promise((resolve, reject) => {
    db[operation](query, params, function (err, result) {
      if (err) {
        reject(err);
        return;
      }
      if (operation === 'run') {
        resolve({ lastID: this.lastID, changes: this.changes });
        return;
      }
      resolve(result);
    });
  });
}

/**
 * クエリを実行します.
 * @param {string} query クエリ.
 * @param {array} params パラメータ.
 * @returns {Promise<{lastID: number, changes: number}>} 実行結果.
 * ※lastID：自動採番ID.
 * ※changes：更新・削除された行数.
 */
function execute(query, params) {
  return accessDatabase('run', query, params);
}

/**
 * データを1件取得します.
 * @param {string} query クエリ.
 * @param {array} params パラメータ.
 * @returns {Promise<object|undefined>} 取得結果.
 */
function findOne(query, params) {
  return accessDatabase('get', query, params);
}

/**
 * データを複数件取得します.
 * @param {string} query クエリ.
 * @param {array} params パラメータ.
 * @returns {Promise<object[]>} 取得結果.
 */
function findAll(query, params) {
  return accessDatabase('all', query, params);
}

/**
 * データベースを初期化します.
 * @returns {Promise<{lastID: number, changes: number}>} 実行結果.
 */
function initializeDatabase() {
  const query =
    'create table if not exists tasks (id TEXT PRIMARY KEY, title TEXT NOT NULL, done INTEGER NOT NULL, priority TEXT NOT NULL, created_at TEXT NOT NULL)';
  return execute(query, []);
}

/**
 * 新規タスクを追加します.
 * @param {object} task タスク.
 * @returns {Promise<{lastID: number, changes: number}>} 実行結果.
 */
function addTask(task) {
  const query = 'insert into tasks(id, title, done, priority, created_at) values(?,?,?,?,?)';
  return execute(query, [task.id, task.title, task.completed ? 1 : 0, task.priority, task.createdAt]);
}

/**
 * タスクの総数を取得します.
 * @returns {Promise<number>} タスクの総数.
 */
async function getTotalCount() {
  const query = 'select count(*) AS count from tasks';
  const row = await findOne(query, []);
  return row.count;
}

/**
 * タスク一覧を取得します.
 * @param {object} options オプション.
 * @returns {Promise<object[]>} タスク一覧.
 */
async function getTaskList(options) {
  const query = 'select * from tasks';

  const getFilteredQuery = (options) => {
    if (options.done) return query + ' where done = 1';
    if (options.todo) return query + ' where done = 0';
    return query;
  };

  const rows = await findAll(getFilteredQuery(options), []);
  return rows.map(convertRowToTask);
}

/**
 * タスクを検索します.
 * @param {string} text 検索文字列.
 * @returns {Promise<object[]>} 検索結果.
 */
async function searchTask(text) {
  const query = 'select * from tasks where title like ?';
  const rows = await findAll(query, [`%${text}%`]);
  return rows.map(convertRowToTask);
}

/**
 * 統計を取得します.
 * @returns {Promise<object>} 統計.
 */
function getStats() {
  const query =
    "select count(*) AS total, count(CASE WHEN done = 1 THEN 1 END) AS completed, count(CASE WHEN done = 0 THEN 1 END) AS notCompleted, count(CASE WHEN datetime(created_at) > datetime('now', '-7 days') THEN 1 END) AS recent from tasks";
  return findOne(query, []);
}

/**
 * タスクを取得します.
 * @param {string} id タスクID.
 * @returns {Promise<object>} タスク.
 */
async function getTaskById(id) {
  const query = 'select * from tasks where id = ?';
  const row = await findOne(query, [id]);
  return row ? convertRowToTask(row) : null;
}

/**
 * タスクを完了状態に更新します.
 * @param {string} id タスクID.
 * @returns {Promise<{lastID: number, changes: number}>} 実行結果.
 */
function updateTask(id) {
  const query = 'update tasks set done = 1 where id = ?';
  return execute(query, [id]);
}

/**
 * タスクを削除します.
 * @param {string} id タスクID.
 * @returns {Promise<{lastID: number, changes: number}>} 実行結果.
 */
function deleteTask(id) {
  const query = 'delete from tasks where id = ?';
  return execute(query, [id]);
}

/**
 * データベースのレコードをタスクオブジェクトに変換します.
 * @param {object} row データベースのレコード.
 * @returns {object} タスクオブジェクト.
 */
function convertRowToTask(row) {
  return {
    id: row.id,
    title: row.title,
    completed: row.done === 1,
    priority: row.priority,
    createdAt: row.created_at,
  };
}

module.exports = {
  initializeDatabase,
  addTask,
  getTotalCount,
  getTaskList,
  searchTask,
  getStats,
  getTaskById,
  updateTask,
  deleteTask,
};
