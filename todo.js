// コマンドライン引数の解析.
const commander = require('commander');
const program = new commander.Command();
// ターミナル出力の色付け.
const chalk = require('chalk');
// 各コマンドの処理.
const commands = require('./commands.js');


// add コマンド.
program
  .command('add')
  .argument('<title>', 'String argument')
  .action((title) => {
    // タスク追加処理.
    const task = commands.addTask(title);
    // 追加完了メッセージを chalk の緑色で表示する.
    console.log(chalk.green(`タスクを追加しました. ID: ${task.id}, タイトル: ${task.title}`));
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