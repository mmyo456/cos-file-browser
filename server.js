const express = require('express');
const { getFileList } = require('./utils/cos');
require('dotenv').config();

console.log('Starting server...');
console.log('Environment variables:', {
  COS_BUCKET: process.env.COS_BUCKET,
  COS_REGION: process.env.COS_REGION,
  COS_SECRET_ID: process.env.COS_SECRET_ID ? '已设置' : '未设置',
  COS_SECRET_KEY: process.env.COS_SECRET_KEY ? '已设置' : '未设置',
  CUSTOM_DOMAIN: process.env.CUSTOM_DOMAIN,
  PORT: process.env.PORT
});

const app = express();

// 调试环境变量
app.get('/api/debug', (req, res) => {
  res.json({
    COS_BUCKET: process.env.COS_BUCKET || '未设置',
    COS_REGION: process.env.COS_REGION || '未设置',
    COS_SECRET_ID: process.env.COS_SECRET_ID ? '已设置' : '未设置',
    COS_SECRET_KEY: process.env.COS_SECRET_KEY ? '已设置' : '未设置',
    CUSTOM_DOMAIN: process.env.CUSTOM_DOMAIN || '未设置'
  });
});

// 提供 COS 配置
app.get('/api/config', (req, res) => {
  res.json({
    bucket: process.env.COS_BUCKET,
    region: process.env.COS_REGION,
    customDomain: process.env.CUSTOM_DOMAIN
  });
});

// 获取文件列表
app.get('/api/files', async (req, res) => {
  const prefix = req.query.prefix || '';
  try {
    const data = await getFileList(prefix);
    res.set('Cache-Control', 'public, max-age=300');
    res.json({
      Contents: data.Contents || [],
      CommonPrefixes: data.CommonPrefixes || []
    });
  } catch (error) {
    console.error('获取文件列表失败:', error.message);
    res.status(500).json({ error: '无法获取文件列表，请检查存储桶配置' });
  }
});

// 提供静态文件
app.use(express.static('public', {
  etag: false,
  lastModified: false
}));

// 本地启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Vercel Serverless 导出
module.exports = app;