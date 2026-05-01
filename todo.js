// コマンドライン引数の解析.
const commander = require("commander");
const program = new commander.Command();
const Option = commander.Option;
// ターミナル出力の色付け.
const chalk = require("chalk");
// 各コマンドの処理.
const commands = require("./commands.js");
// 表示処理.
const viewer = require("./viewer.js");
// 優先度の種別一覧.
const { PRIORITY_TYPES } = require("./priorityTypes.js");

// オプションの入力チェック関数.
function checkPriority(value, dummyPrevious) {
  // 指定の値をチェック.
  if (!PRIORITY_TYPES.includes(value))
    throw new commander.InvalidArgumentError(
      "priorityは high / medium / low の中から指定してください。",
    );
  // 指定の値を返す.
  return value;
}

// add コマンド.
program
  .command("add")
  .option("--priority <type>", "タスクの優先度", checkPriority, "medium")
  .argument("<title>", "String argument")
  .action((title, options) => {
    // タスク追加処理.
    const task = commands.addTask(title, options.priority);
    // 完了メッセージ表示処理.
    viewer.viewCompleteMessage(task, "add");
  });

// list コマンド.
program
  .command("list")
  .addOption(new Option("--done", "完了タスクのみを表示する").conflicts("todo"))
  .addOption(
    new Option("--todo", "未完了タスクのみを表示する").conflicts("done"),
  )
  .action((options) => {
    // タスク一覧取得処理.
    const taskList = commands.getTaskList(options);
    // タスク表示処理.
    viewer.viewTask(taskList, "list");
  });

// search コマンド.
program
  .command("search")
  .argument("<text>", "String argument")
  .action((text) => {
    // タスク検索処理.
    const taskList = commands.searchTask(text);
    // タスク表示処理.
    viewer.viewTask(taskList, "search");
  });

// stats コマンド.
program.command("stats").action(() => {
  // 統計取得処理.
  const status = commands.getStats();
  // 統計表示処理.
  viewer.viewStatus(status);
});

// done コマンド.
program
  .command("done")
  .argument("<id>", "String argument")
  .action((id) => {
    // タスク更新処理.
    const target = commands.updateTask(id);
    // 完了メッセージ表示処理.
    viewer.viewCompleteMessage(target, "done");
  });

// delete コマンド.
program
  .command("delete")
  .argument("<id>", "String argument")
  .action((id) => {
    // タスク更新処理.
    const target = commands.deleteTask(id);
    // 完了メッセージ表示処理.
    viewer.viewCompleteMessage(target, "delete");
  });

// デフォルトコマンド.
program.command("print-help", { isDefault: true, hidden: true }).action(() => {
  // ヘルプを表示する.
  program.outputHelp();
});

// エラー検出時にprocess.exit()ではなく、CommanderErrorをthrowする.
program.exitOverride();

// async関数の中でawaitを呼び出す.
(async () => {
  try {
    // process.argv を解析し、Electron および特別な Node.js フラグを自動検出.
    await program.parseAsync(process.argv);
  } catch (err) {
    // エラーメッセージを chalk の赤色で表示する.
    console.error(chalk.red(err.message));
    // 終了コードに 1 を設定する.
    process.exitCode = 1;
  }
})();
