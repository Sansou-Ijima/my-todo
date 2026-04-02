// コマンドライン引数の解析.
const commander = require('commander');
const program = new commander.Command();
// ターミナル出力の色付け.
const chalk = require('chalk');
// タスク定義.
const Task = require('./task.js');
// 各コマンドの処理.
const commands = require('./commands.js');


// add コマンド.
program
  .command('add')
  .argument('<title>', 'String argument')
  .action((title) => {
    // タスクを作成.
    const task = new Task(title);
    // タスク追加処理.
    commands.addTask(task);
    // 追加完了メッセージを chalk の緑色で表示する.
    console.log(chalk.green(`タスクを追加しました. ID: ${task.id}, タイトル: ${task.title}`));
  });

// list コマンド.
program
  .command('list')
  .action(() => {
    // タスク表示処理.
    commands.viewTaskList();
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


// エラー検出時にprocess.exit()ではなく、CommanderErrorをthrowする.
program.exitOverride();

// async関数の中でawaitを呼び出す.
(async () => {
  try {
    // process.argv を解析し、Electron および特別な Node.js フラグを自動検出.
    await program.parseAsync(process.argv);
  } catch (err) {
    console.error(chalk.red(err.message));
  }
})();