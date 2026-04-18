// コマンドライン引数の解析.
const commander = require('commander');
const program = new commander.Command();
// ターミナル出力の色付け.
const chalk = require('chalk');
// 各コマンドの処理.
const commands = require('./commands.js');


// オプションの入力チェック関数.
function checkPriority(value, dummyPrevious) {
  // 優先度は high / medium / low の3段階.
  const type = ['high', 'medium', 'low'];
  // 指定の値をチェック.
  if (!type.includes(value)) throw new commander.InvalidArgumentError('priorityは high / medium / low の中から指定してください。');
  // 指定の値を返す.
  return value;
}

// add コマンド.
program
  .command('add')
  .option('--priority <type>', 'タスクの優先度', checkPriority, 'medium')
  .argument('<title>', 'String argument')
  .action((title, options) => {
    // タスク追加処理.
    const task = commands.addTask(title, options.priority);
    // 追加完了メッセージを chalk の緑色で表示する.
    console.log(chalk.green(`タスクを追加しました. ID: ${task.id}, タイトル: ${task.title}, 優先度: ${task.priority}`));
  });

// list コマンド.
program
  .command('list')
  .option('--done', '完了タスクのみを表示する')
  .option('--todo', '未完了タスクのみを表示する')
  .action((options) => {
    // todo: オプションの複数指定チェック or 複数指定時に両方表示する.
    // タスク表示処理.
    commands.viewTaskList(options);
  });

// search コマンド.
program
  .command('search')
  .argument('<text>', 'String argument')
  .action((text) => {
    // タスク検索処理.
    commands.searchTask(text);
  });

// done コマンド.
program
  .command('done')
  .argument('<id>', 'String argument')
  .action((id) => {
    // タスク更新処理.
    const target = commands.updateTask(id);
    // 追加完了メッセージを chalk の緑色で表示する.
    console.log(chalk.green(`タスクを完了にしました. ID: ${target.id}, タイトル: ${target.title}`));
  });

// delete コマンド.
program
  .command('delete')
  .argument('<id>', 'String argument')
  .action((id) => {
    // タスク更新処理.
    const target = commands.deleteTask(id);
    // 削除完了メッセージを chalk の緑色で表示する.
    console.log(chalk.yellow(`タスクを削除しました. ID: ${target.id}, タイトル: ${target.title}`));
  });

// デフォルトコマンド.
program
  .command('print-help', { isDefault: true, hidden: true })
  .action(() => {
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
    process.exitCode = 1
  }
})();