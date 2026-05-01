// ファイルを扱うためのモジュール.
const fs = require("fs");
// データ管理ファイル.
const DATA_FILE = `${__dirname}/tasks.json`;
// 優先度の種別一覧.
const { PRIORITY_TYPES } = require("./priorityTypes.js");

/**
 * データを取得します.
 * @returns {object} データ（タスク一覧）.
 */
function getData() {
  try {
    const dataJSON = fs.readFileSync(DATA_FILE, "utf-8");

    const data = JSON.parse(dataJSON);

    if (!checkData(data)) {
      console.warn("保存されているデータが不正です.");
      return []; // 空の配列を返す.
    }

    return data;
  } catch (err) {
    // デバック用.
    // console.error(err);

    // ファイルが存在しない場合.
    if (err.code === "ENOENT") {
      console.warn("データファイルが存在しません.");
      return []; // 空の配列を返す.
    }

    throw new Error("データの取得に失敗しました.");
  }
}

/**
 * データを保存します.
 * @param {object} data データ（タスク一覧）.
 */
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
  } catch (err) {
    // デバック用.
    // console.error(err);

    throw new Error("データの保存に失敗しました.");
  }
}

/**
 * データの整合性をチェックします.
 * @param {object} data データ（タスク一覧）.
 * @returns {boolean} 整合性.
 */
function checkData(data) {
  if (!Array.isArray(data)) return false;
  for (let task of data) {
    // 各フィールドの型チェック.
    if (typeof task.id !== "string") return false;
    if (typeof task.createdAt !== "string") return false;
    if (typeof task.title !== "string") return false;
    if (typeof task.completed !== "boolean") return false;
    if (typeof task.priority !== "string") return false;
    // 優先度の種別チェック.
    if (!PRIORITY_TYPES.includes(task.priority)) return false;
  }
  return true;
}

module.exports = {
  getData: getData,
  saveData: saveData,
};
