# cos-file-browser
目前仅支持腾讯云
## 介绍
使用Vercel实现无需服务器可在网页查看腾讯cos目录环境
![www.png](https://github.com/mmyo456/cos-file-browser/blob/149ab596fcde279510037dba186004eeef11462a/img/www.png) <br>
## 技术栈
- Node.js
- Express
- Cos-nodejs-sdk-v5
- dotenv
- uuid

## 运行
环境：
- Node.js 22.2.0

### 项目启动
```
npm install
npm start
```

### 项目部署
可以使用Vercel实现无服务器部署
### 项目测试
```
npm dev
```

## 项目布局
```
├── .env                    # 环境变量（本地开发，敏感信息）
├── .gitignore              # Git 忽略文件（忽略 node_modules 等）
├── package.json            # 依赖、脚本、Node.js 版本
├── vercel.json             # Vercel 部署配置（构建和路由）
├── server.js               # 后端 Express 服务器（API 和静态文件）
├── public/                 # 前端静态资源
│   ├── index.html          # 主页面（响应式 UI）
│   └── scripts/
│       └── app.js          # 前端逻辑（文件列表、导航）
└── utils/                  # 工具模块
    └── cos.js              # 腾讯云 COS 操作
```
