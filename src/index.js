#!/usr/bin/env node

import { checkAndShowEnv, initConfig } from './util/config_reader.js';
import { flomo2md } from './util/flomo2md.js';
import { printDoc } from './util/print-doc.js';

// 获取命令行参数
const args = process.argv.slice(2);

const CMDS = {
  ENV: 'env',
  FLOMO2MD: 'flomo2md',
};
const cmdWords = [CMDS.FLOMO2MD];

if (args.length === 0) {
  printDoc();
} else if (args[0] === 'env') {
  checkAndShowEnv();
} else if (cmdWords.indexOf(args[0]) >= 0) {
  initConfig();
  switch (args[0]) {
    case CMDS.FLOMO2MD:
      flomo2md();
      break;
    default:
      printDoc();
  }
} else {
  printDoc();
}
