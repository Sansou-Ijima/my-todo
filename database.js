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

module.exports = {
  initializeDatabase,
};
