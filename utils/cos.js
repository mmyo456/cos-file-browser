const COS = require('cos-nodejs-sdk-v5');
require('dotenv').config();

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY
});

async function getFileList(prefix = '') {
  try {
    if (!process.env.COS_BUCKET) throw new Error('COS_BUCKET 环境变量缺失');
    if (!process.env.COS_REGION) throw new Error('COS_REGION 环境变量缺失');
    if (!process.env.COS_SECRET_ID || !process.env.COS_SECRET_KEY) {
      throw new Error('COS 凭证缺失');
    }

    console.log('COS 配置:', {
      Bucket: process.env.COS_BUCKET,
      Region: process.env.COS_REGION,
      Prefix: prefix
    });

    const data = await cos.getBucket({
      Bucket: process.env.COS_BUCKET,
      Region: process.env.COS_REGION,
      Prefix: prefix,
      Delimiter: '/',
      MaxKeys: 100
    });
    return data;
  } catch (error) {
    console.error('COS getBucket 错误:', error);
    throw new Error(`获取文件列表失败: ${error.message}`);
  }
}

module.exports = { getFileList };