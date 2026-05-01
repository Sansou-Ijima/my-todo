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

/**
 * 指定の値が優先度の種別一覧に含まれているかをチェックします.
 * @param {string} value 指定の値（オプション引数）.
 * @param {string} dummyPrevious ダミー値（オプションの以前の値）.
 * @returns {string} 指定の値.
 */
function checkPriority(value, dummyPrevious) {
  if (!PRIORITY_TYPES.includes(value))
    throw new commander.InvalidArgumentError(
      "priorityは high / medium / low の中から指定してください。",
    );
  return value;
}

// add コマンド.
program
  .command("add")
  .option("--priority <type>", "タスクの優先度", checkPriority, "medium")
  .argument("<title>", "String argument")
  .action((title, options) => {
    const task = commands.addTask(title, options.priority);

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
    const taskList = commands.getTaskList(options);

    viewer.viewTask(taskList, "list");
  });

// search コマンド.
program
  .command("search")
  .argument("<text>", "String argument")
  .action((text) => {
    const taskList = commands.searchTask(text);

    viewer.viewTask(taskList, "search");
  });

// stats コマンド.
program.command("stats").action(() => {
  const status = commands.getStats();

  viewer.viewStatus(status);
});

// done コマンド.
program
  .command("done")
  .argument("<id>", "String argument")
  .action((id) => {
    const target = commands.updateTask(id);

    viewer.viewCompleteMessage(target, "done");
  });

// delete コマンド.
program
  .command("delete")
  .argument("<id>", "String argument")
  .action((id) => {
    const target = commands.deleteTask(id);

    viewer.viewCompleteMessage(target, "delete");
  });

// デフォルトコマンド.
program.command("print-help", { isDefault: true, hidden: true }).action(() => {
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
