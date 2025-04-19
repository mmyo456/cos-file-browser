require('dotenv').config();

// 渲染 HTML 内容
function renderHtml(files, prefix) {
  // 生成路径显示
  const pathParts = prefix ? prefix.split('/').filter(p => p) : [];
  const pathDisplay = pathParts.length ? `root > ${pathParts.join(' > ')}` : 'root';
  
  // 使用自定义域名
  const baseUrl = process.env.CUSTOM_DOMAIN;

  // 生成文件列表 HTML
  const fileListHtml = files.length === 0 
    ? '<p class="text-gray-500">此目录为空</p>'
    : files.map(file => {
        const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file.Key);
        const thumbnail = isImage 
          ? `<img src="${baseUrl}/${file.Key}?imageMogr2/thumbnail/100x" class="w-16 h-16 object-cover mr-4">`
          : `<div class="w-16 h-16 bg-gray-200 flex items-center justify-center mr-4">文件</div>`;
        const fileUrl = `${baseUrl}/${file.Key}`;
        
        return `
          <div class="flex items-center p-2 border-b">
            ${thumbnail}
            <div class="flex-1">
              <p class="text-sm">${file.Key}</p>
              <p class="text-xs text-gray-500">${new Date(file.LastModified).toLocaleString()}</p>
              <a href="${fileUrl}" target="_blank" class="text-blue-600 hover:underline">打开文件</a>
            </div>
          </div>
        `;
      }).join('');

  // HTML 模板
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>文件列表 - ${pathDisplay}</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100">
      <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">文件列表</h1>
        <div class="bg-white p-4 rounded shadow">
          <h2 class="text-lg font-semibold mb-2">路径: ${pathDisplay}</h2>
          <div class="grid grid-cols-1 gap-4">
            ${fileListHtml}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = { renderHtml };