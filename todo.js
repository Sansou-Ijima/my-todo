const commander = require('commander');
const program = new commander.Command();
const Option = commander.Option;
const chalk = require('chalk');
const commands = require('./commands.js');
const output = require('./output.js');
const priorities = require('./priorityTypes.js');
const database = require('./database.js');

/**
 * 指定の値が優先度の種別一覧に含まれているかをチェックします.
 * @param {string} value 指定の値（オプション引数）.
 * @returns {string} 指定の値.
 */
function checkPriority(value) {
  if (!priorities.LEVELS.includes(value))
    throw new commander.InvalidArgumentError('priorityは high / medium / low の中から指定してください。');
  return value;
}

program
  .command('add')
  .option('--priority <type>', 'タスクの優先度', checkPriority, 'medium')
  .argument('<title>', 'String argument')
  .action(async (title, options) => {
    const task = await commands.addTask(title, options.priority);

    output.outputCompleteMessage(task, 'add');
  });

program
  .command('list')
  .addOption(new Option('--done', '完了タスクのみを表示する').conflicts('todo'))
  .addOption(new Option('--todo', '未完了タスクのみを表示する').conflicts('done'))
  .action(async (options) => {
    const taskListResult = await commands.getTaskList(options);

    output.outputTask(taskListResult);
  });

program
  .command('search')
  .argument('<text>', 'String argument')
  .action(async (text) => {
    const taskListResult = await commands.searchTask(text);

    output.outputTask(taskListResult);
  });

program.command('stats').action(async () => {
  const status = await commands.getStats();

  output.outputStatus(status);
});

program
  .command('done')
  .argument('<id>', 'String argument')
  .action(async (id) => {
    const target = await commands.updateTask(id);

    output.outputCompleteMessage(target, 'done');
  });

program
  .command('delete')
  .argument('<id>', 'String argument')
  .action(async (id) => {
    const target = await commands.deleteTask(id);

    output.outputCompleteMessage(target, 'delete');
  });

program.command('print-help', { isDefault: true, hidden: true }).action(() => {
  program.outputHelp();
});

// エラー検出時にprocess.exit()ではなく、CommanderErrorをthrowする.
program.exitOverride();

(async () => {
  try {
    // テーブルが存在しない場合は作成する.
    await database.initializeDatabase();

    // process.argv を解析し、Electron および特別な Node.js フラグを自動検出.
    await program.parseAsync(process.argv);
  } catch (err) {
    console.error(chalk.red(err.message));
    process.exitCode = 1;
  }
})();
