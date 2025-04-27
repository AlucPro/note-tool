import chalk from 'chalk';
import { docContent } from '../doc/help.js';

// 方法：打印同目录下DOC.md的内容
function printDoc() {
  try {
    console.log(chalk.green('📄'));
    console.log(chalk.blue(docContent));
  } catch (err) {
    console.error(chalk.red('Read DOC.md failed: '), err.message);
    process.exit(1);
  }
}

export { printDoc };
