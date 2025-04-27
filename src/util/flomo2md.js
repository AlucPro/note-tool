import chalk from 'chalk';
import fse from 'fs-extra';
import { parse } from 'node-html-parser';
import path from 'path';
import { cfg } from './config_reader.js';
import { log } from './log.js';

let fileCounter = 0;
const FILE_PREFIX = 'flomo___';

function parseCfg() {
  const { FLOMO_DIST_DIR, FLOMO_HTML_SOURCE_DIR } = cfg;
  return {
    sourceDir: FLOMO_HTML_SOURCE_DIR,
    distDir: FLOMO_DIST_DIR,
  };
}

// 打印任务信息
function printInfo() {
  const cfg = parseCfg();
  console.log(
    chalk.bold('→ This task gen flomo export html file to markdown file')
  );
  console.log(JSON.stringify(cfg, null, 2));
}

// 初始化目录
function initDirectories() {
  const { distDir } = parseCfg();
  log(chalk.blue('\n1. init Dir'));
  log(`→ clean dir: ${distDir}`);
  fse.removeSync(distDir);
  fse.mkdirSync(distDir);
}

// 复制资源文件
function copyResourceFiles() {
  const { sourceDir, distDir } = parseCfg();
  log(chalk.blue('\n2. copu img resource file to dist'));
  log(`→ copy from ${sourceDir} to ${distDir}`);
  fse.copySync(sourceDir, distDir);
}

// 处理 HTML 文件
function processHtmlFiles() {
  const { sourceDir } = parseCfg();
  log(chalk.blue('\n3. process html file'));
  const files = fse.readdirSync(sourceDir);
  const htmlFiles = files.filter((file) => file.endsWith('.html'));

  log(`→ find ${htmlFiles.length} html files`);
  htmlFiles.forEach((file) => {
    const filePath = path.join(sourceDir, file);
    processHtmlFile(filePath);
  });
}

// 处理单个 HTML 文件
function processHtmlFile(filePath) {
  try {
    log(`\n→ process file: ${path.basename(filePath)}`);
    const fileContent = fse.readFileSync(filePath, 'utf-8');
    const root = parse(fileContent);
    const memos = root.querySelectorAll('.memo');

    log(`→ find ${memos.length} memos`);
    memos.forEach((memo) => {
      const { content, dateStr } = extractMemoContent(memo);
      const parsedContent = parseContent(content);
      writeMemoToFile(dateStr, parsedContent);
    });
  } catch (error) {
    console.log(chalk.red(`处理文件 ${filePath} 时出错:`), error);
  }
}

// 提取备忘录内容
function extractMemoContent(memo) {
  try {
    fileCounter++;
    const contentEl = parse(memo.innerHTML);

    // 1. 提取文本内容
    const pElArray = contentEl.querySelectorAll('p');
    let content = pElArray.map((pEl) => pEl.innerText).join('\n');

    // 2. 处理图片
    const imgSrcs = contentEl
      .querySelectorAll('img')
      .map((img) => img.getAttribute('src'));

    if (imgSrcs.length > 0) {
      content = `${content}\n\n${imgSrcs
        .map((imgSrc) => `[img](../${imgSrc})`)
        .join('\n')}`;
    }

    // 3. 提取时间
    const timeEl = contentEl.querySelector('div.time');
    const dateStr = timeEl ? timeEl.innerText.trim().slice(0, 10) : 'unknown';

    return { content, dateStr };
  } catch (error) {
    console.log(chalk.red('error when extract memo content:'), error);
    return { content: '', dateStr: 'unknown' };
  }
}

// 解析内容
function parseContent(rawContent) {
  try {
    const tagRe = /^#[^\s]*/;
    const tag =
      (tagRe.exec(rawContent.trim())?.[0] || '').replace('#', '') || 'unknown';

    const rawContentWithoutTag = rawContent.replace(`#${tag}`, '');
    const titleRe = /^.*/;
    const title =
      (titleRe.exec(rawContentWithoutTag.trim())?.[0] || '').replace(
        /\s/g,
        ''
      ) || 'unknown';

    const content = rawContentWithoutTag.replace(title, '').trim();

    return {
      tag,
      title: title.slice(0, 10),
      content: content.length ? content : title,
    };
  } catch (error) {
    console.log(chalk.red('error when parse content:'), error);
    return {
      tag: 'unknown',
      title: 'unknown',
      content: 'unknown',
    };
  }
}

// 写入备忘录文件
function writeMemoToFile(dateStr, parsedContent) {
  const { distDir } = parseCfg();
  try {
    const filePath = path.join(
      distDir,
      dateStr,
      `${FILE_PREFIX}${fileCounter}.md`
    );

    fse.outputFileSync(filePath, parsedContent.content);
    log(chalk.green(`✓ write file: ${path.relative(distDir, filePath)}`));
  } catch (error) {
    console.log(chalk.red('error when write file:'), error);
  }
}

async function flomo2md() {
  fileCounter = 0;

  try {
    // 0. print
    printInfo();

    // 1. 初始化目录
    initDirectories();

    // 2. 复制资源文件
    copyResourceFiles();

    // 3. 处理 HTML 文件
    processHtmlFiles();

    console.log(chalk.green('\n=== process done ==='));
    console.log(chalk.green(`total process file count: ${fileCounter}`));
  } catch (error) {
    console.log(chalk.red('error when process:'), error);
  }
}

export { flomo2md };
