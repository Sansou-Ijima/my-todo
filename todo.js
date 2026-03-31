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
    try {
      // タスクを作成.
      const task = new Task(title);
      // タスク追加処理.
      commands.addTask(task);
      // 追加完了メッセージを chalk の緑色で表示する.
      console.log(chalk.green(`タスクを追加しました. ID: ${task.id}, タイトル: ${task.title}`));
    } catch (err) {
      console.error(chalk.red(err.message));
    }
  });

// list コマンド.
program
  .command('list')
  .action(() => {
    try {
      // タスク表示処理.
      commands.viewTaskList();
    } catch (err) {
      console.error(chalk.red(err.message));
    }
  });

// done コマンド.
program
  .command('done')
  .argument('<id>', 'String argument')
  .action((id) => {
    try {
      // タスク更新処理.
      const target = commands.updateTask(id);
      // 追加完了メッセージを chalk の緑色で表示する.
      console.log(chalk.green(`タスクを完了にしました. ID: ${target.id}, タイトル: ${target.title}`));
    } catch (err) {
      console.error(chalk.red(err.message));
    }
  });

// delete コマンド.
program
  .command('delete')
  .argument('<id>', 'String argument')
  .action((id) => {
    try {
      // タスク更新処理.
      const target = commands.deleteTask(id);
      // 削除完了メッセージを chalk の緑色で表示する.
      console.log(chalk.yellow(`タスクを削除しました. ID: ${target.id}, タイトル: ${target.title}`));
    } catch (err) {
      console.error(chalk.red(err.message));
    }
  });


// process.argv を解析し、Electron および特別な Node.js フラグを自動検出.
program.parse();