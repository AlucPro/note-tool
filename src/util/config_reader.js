import chalk from 'chalk';
import fs from 'fs';
import os from 'os';
import path from 'path';

let cfg;

// Linux 和 macOS 是 ~/.config/note-tool/config.json
// Windows 是 C:\Users\username\.config\note-tool\config.json。
// 读取用户主目录下的配置文件
function readUserConfig() {
  const configDir = path.join(os.homedir(), '.config', 'note-tool');
  const configPath = path.join(configDir, 'config.json');
  try {
    console.log('Try to read: ', configPath);
    const data = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(chalk.red('Read user config file error:', error));
    return null;
  }
}

// 读取项目根目录下的配置文件
function readProjectConfig() {
  const notPrintError = true;
  const configPath = path.join(process.cwd(), 'toolname.config.json');
  try {
    const data = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (!notPrintError) {
      console.error(chalk.red('Read project config file error:', error));
    }
    return null;
  }
}

// 优先读取项目根目录下的配置文件，如果没有则读取用户主目录下的配置文件
function getConfig() {
  const projectConfig = readProjectConfig();
  if (projectConfig) {
    return projectConfig;
  }
  return readUserConfig();
}

function checkAndShowEnv() {
  console.log(chalk.bold('→ start env check'), '\n');
  try {
    const config = getConfig();
    if (config) {
      console.log(
        chalk.green('config content is:'),
        '\n',
        JSON.stringify(config, null, 2)
      );
    }
  } catch (error) {
    console.error(chalk.red('Read config file error:', error));
  }
}

function initConfig(forceUpdate = false) {
  if (cfg && !forceUpdate) {
    return;
  }
  cfg = getConfig();
}

export { cfg, checkAndShowEnv, initConfig };
