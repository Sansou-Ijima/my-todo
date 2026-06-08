const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./todos.db');

/**
 * クエリを実行します.
 * @param {string} operation 操作.
 * @param {string} query クエリ.
 * @param {array} params パラメータ.
 * @returns {Promise} 結果.
 */
function executeQuery(operation, query, params) {
  return new Promise((resolve, reject) => {
    db[operation](query, params, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

/**
 * データベースを初期化します.
 * @returns {Promise} 結果.
 */
function initializeDatabase() {
  const query =
    'create table if not exists tasks (id TEXT PRIMARY KEY, title TEXT NOT NULL, done INTEGER NOT NULL, priority TEXT NOT NULL, created_at TEXT NOT NULL)';
  return executeQuery('run', query, []);
}

/**
 * 新規タスクを追加します.
 * @param {object} task タスク.
 * @returns {Promise} 結果.
 */
function addTask(task) {
  const query = 'insert into tasks(id, title, done, priority, created_at) values(?,?,?,?,?)';
  return executeQuery('run', query, [task.id, task.title, task.completed ? 1 : 0, task.priority, task.createdAt]);
}

/**
 * タスクの総数を取得します.
 * @returns {Promise<number>} タスクの総数.
 */
async function getTotalCount() {
  const query = 'select count(*) AS count from tasks';
  const result = await executeQuery('get', query, []);
  return result.count;
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

  const rows = await executeQuery('all', getFilteredQuery(options), []);
  return rows.map(convertRowToTask);
}

/**
 * タスクを取得します.
 * @param {string} id タスクID.
 * @returns {Promise<object>} タスク.
 */
async function getTaskById(id) {
  const query = 'select * from tasks where id = ?';
  const result = await executeQuery('get', query, [id]);
  return result ? convertRowToTask(result) : null;
}

/**
 * タスクを完了状態に更新します.
 * @param {string} id タスクID.
 * @returns {Promise} 結果.
 */
function updateTask(id) {
  const query = 'update tasks set done = 1 where id = ?';
  return executeQuery('run', query, [id]);
}

/**
 * タスクを削除します.
 * @param {string} id タスクID.
 * @returns {Promise} 結果.
 */
function deleteTask(id) {
  const query = 'delete from tasks where id = ?';
  return executeQuery('run', query, [id]);
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
  getTaskById,
  updateTask,
  deleteTask,
};
