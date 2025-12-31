# 票务管理系统 (Ticket Management System)

一个类似 Jira 的票务管理系统，使用 Express.js、React 和 MongoDB 构建，采用 Apple 风格设计。

## 功能特性

- ✅ 创建、查看、更新和删除票务
- ✅ 票务状态管理（待处理、进行中、已完成、已取消）
- ✅ 优先级设置（低、中、高、紧急）
- ✅ 评论功能
- ✅ 搜索和筛选
- ✅ 响应式设计
- ✅ Apple 风格的用户界面

## 技术栈

- **后端**: Express.js, MongoDB, Mongoose
- **前端**: React, React Router, Vite
- **数据库**: MongoDB
- **容器化**: Docker, Docker Compose

## 项目结构

```
ticket_management/
├── backend/              # Express.js API
│   ├── models/          # MongoDB 模型
│   ├── routes/          # API 路由
│   ├── server.js        # 服务器入口
│   └── Dockerfile
├── frontend/            # React 前端
│   ├── src/
│   │   ├── components/  # React 组件
│   │   ├── pages/       # 页面组件
│   │   ├── services/    # API 服务
│   │   └── App.jsx
│   └── Dockerfile
└── docker-compose.yml    # Docker Compose 配置
```

## 快速开始

### 使用 Docker Compose（推荐）

1. 确保已安装 Docker 和 Docker Compose

2. 启动所有服务：
```bash
docker-compose up -d
```

3. 访问应用：
   - 前端: http://localhost:3000/tickets-manager/
   - API: http://localhost:3003/tickets-manager/api/

### 本地开发

#### 后端

```bash
cd backend
npm install
npm run dev
```

#### 前端

```bash
cd frontend
npm install
npm run dev
```

## API 端点

所有 API 端点都以 `/tickets-manager/api` 开头：

- `GET /tickets-manager/api/tickets` - 获取所有票务
- `GET /tickets-manager/api/tickets/:id` - 获取单个票务
- `POST /tickets-manager/api/tickets` - 创建票务
- `PUT /tickets-manager/api/tickets/:id` - 更新票务
- `DELETE /tickets-manager/api/tickets/:id` - 删除票务
- `POST /tickets-manager/api/tickets/:id/comments` - 添加评论

## 环境变量

后端环境变量（`backend/.env`）：
- `PORT`: 服务器端口（默认: 3001）
- `MONGODB_URI`: MongoDB 连接字符串
- `JWT_SECRET`: JWT 密钥

## 注意事项

- 前端 URL 路径以 `/tickets-manager/` 开头
- API URL 路径以 `/tickets-manager/api/` 开头
- 这些路径前缀是为了方便集成到更大的 Web 应用中

## 许可证

MIT


