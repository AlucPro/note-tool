#!/usr/bin/env node

import { checkAndShowEnv } from "./util/config_reader.js";

// 获取命令行参数
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("TOBE CONTINUE");
} else if (args[0] === "env") {
  checkAndShowEnv();
} else {
  console.log("TOBE CONTINUE");
}
