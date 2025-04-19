const fs = require('fs');
const path = require('path');
const { getFileList } = require('./utils/cos');
const { renderHtml } = require('./utils/htmlRenderer');
require('dotenv').config();

const outputDir = 'output';
const prefix = process.argv.includes('--prefix') 
  ? process.argv[process.argv.indexOf('--prefix') + 1] || ''
  : '';

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// 生成 HTML 文件
async function buildHtml() {
  try {
    const data = await getFileList(prefix);
    const htmlContent = renderHtml(data.Contents || [], prefix);
    
    // 保存 HTML 文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = prefix ? prefix.replace(/\//g, '-') : 'root';
    const outputPath = path.join(outputDir, `index-${filename}-${timestamp}.html`);
    
    fs.writeFileSync(outputPath, htmlContent);
    console.log(`HTML 文件已生成: ${outputPath}`);
    console.log(`请手动上传到 COS 存储桶，然后通过 ${process.env.CUSTOM_DOMAIN} 访问`);
  } catch (error) {
    console.error('生成 HTML 失败:', error);
    process.exit(1);
  }
}

// 执行
buildHtml();