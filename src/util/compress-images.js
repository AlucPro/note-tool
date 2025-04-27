import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 支持压缩的图片扩展名
const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 打印任务信息
function printInfo() {
  console.log(chalk.bold('→ Starting image compression task\n'));
}

async function compressImage(inputPath, outputPath) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    let format = metadata.format;

    // 获取原始文件大小
    const originalSize = fs.statSync(inputPath).size;

    // 根据图片格式选择不同的压缩参数
    let pipeline = image;
    if (format === 'jpeg' || format === 'jpg') {
      pipeline = pipeline.jpeg({ quality: 70 });
    } else if (format === 'png') {
      pipeline = pipeline.png({ quality: 70, compressionLevel: 8 });
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ quality: 70 });
    } else if (format === 'gif') {
      // gif 通常压缩意义不大，不处理
      pipeline = pipeline.gif();
    }

    await pipeline.toFile(outputPath);

    // 获取压缩后的文件大小
    const compressedSize = fs.statSync(outputPath).size;
    const reduction = (
      ((originalSize - compressedSize) / originalSize) *
      100
    ).toFixed(2);

    console.log(
      chalk.green(`✅ Successfully compressed: ${path.basename(inputPath)}`),
      '\n',
      chalk.blue(`   Original size: ${formatFileSize(originalSize)}`),
      '\n',
      chalk.green(`   Compressed size: ${formatFileSize(compressedSize)}`),
      '\n',
      chalk.yellow(`   Reduction: ${reduction}%`)
    );
  } catch (error) {
    console.error(
      chalk.red(`❌ Compression failed: ${inputPath}`),
      error.message
    );
  }
}

async function CompressImgMain(dir) {
  printInfo();

  const inputDir = dir ? path.resolve(dir) : process.cwd();

  console.log(chalk.cyan(`🚀 Starting compression in directory: ${inputDir}`));

  if (!fs.existsSync(inputDir)) {
    console.error(chalk.red('❌ Directory does not exist!'));
    process.exit(1);
  }

  const files = fs.readdirSync(inputDir);

  const images = files.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return SUPPORTED_IMAGE_EXTENSIONS.includes(ext);
  });

  if (images.length === 0) {
    console.log(chalk.yellow('⚠️ No supported image files found.'));
    process.exit(0);
  }

  const outputDirName = `img_export_${Date.now()}`;
  const outputDir = path.join(inputDir, outputDirName);

  fs.mkdirSync(outputDir);

  console.log(chalk.blue(`📂 Created output directory: ${outputDirName}`));

  for (const image of images) {
    const inputPath = path.join(inputDir, image);
    const outputPath = path.join(outputDir, image);

    await compressImage(inputPath, outputPath);
  }

  console.log(
    chalk.green(
      `🎉 All images compressed successfully! Compressed images are saved in ${outputDirName}`
    )
  );
}

export { CompressImgMain };
