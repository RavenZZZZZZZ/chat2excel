# 环境变量配置说明

## 文件结构

```
chat2excel/
├── .env                          # 后端实际配置（包含真实密钥，不提交）
├── .env.example                  # 后端配置模板（提交）
│
└── chat2excel-frontend/
    ├── .env.local                # 前端实际配置（包含真实密钥，不提交）
    └── .env.example              # 前端配置模板（提交）
```

## 配置说明

### 后端环境变量（根目录 .env）

```env
# Doc2X API Configuration
DOC2X_API_KEY=sk-otgzt9qpmdqfvy1zkwc0x120ihttmtkq

# Optional: Custom API Base URL (default: https://v2.doc2x.noedgeai.com)
# DOC2X_API_BASE_URL=https://v2.doc2x.noedgeai.com

# Server Configuration
PORT=3001
```

**说明**:
- `DOC2X_API_KEY`: Doc2X API 密钥（必需）
- `DOC2X_API_BASE_URL`: API 基础 URL（可选，默认为官方地址）
- `PORT`: 服务器端口（可选，默认 3001）

### 前端环境变量（chat2excel-frontend/.env.local）

```env
VITE_DOC2X_API_KEY=sk-otgzt9qpmdqfvy1zkwc0x120ihttmtkq
VITE_DOC2X_PROXY_URL=http://localhost:3001/api/proxy
VITE_DOC2X_TIMEOUT=60000
```

**说明**:
- `VITE_DOC2X_API_KEY`: Doc2X API 密钥（可选，如果使用代理服务器则不需要）
- `VITE_DOC2X_PROXY_URL`: 后端代理服务器地址
- `VITE_DOC2X_TIMEOUT`: 请求超时时间（毫秒）

**注意**: 前端通过后端代理服务器调用 Doc2X API，因此前端的 API 密钥可以省略或留空。

## Git 忽略规则

### 根目录 .gitignore
```
# 环境变量
.env
.env.local
.env.*.local
```

### 前端 .gitignore
```
# 环境变量文件
.env
.env.local
.env.production.local
.env.development.local
.env.test.local
.env*.local
```

**所有包含真实密钥的 .env 文件都不会被提交到 Git 仓库**

## 安全建议

### ✅ 最佳实践
1. **永远不要**将包含真实密钥的 `.env` 或 `.env.local` 文件提交到 Git
2. 使用 `.env.example` 作为配置模板
3. 在 README 中说明如何配置环境变量
4. 定期轮换 API 密钥
5. 为不同环境（开发、测试、生产）使用不同的密钥

### ⚠️ 常见错误
1. ❌ 在代码中硬编码密钥（已修复）
2. ❌ 将 `.env` 文件提交到 Git（已被 .gitignore 阻止）
3. ❌ 在公开代码中保留密钥历史（需要使用 git filter-branch 清理）
4. ❌ 在多个环境使用同一个密钥

## 初始设置

### 新开发者设置

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd chat2excel
   ```

2. **安装依赖**
   ```bash
   # 安装后端依赖
   npm install

   # 安装前端依赖
   cd chat2excel-frontend
   npm install
   cd ..
   ```

3. **配置环境变量**
   ```bash
   # 后端配置
   cp .env.example .env
   # 编辑 .env，填入你的 DOC2X_API_KEY

   # 前端配置
   cp chat2excel-frontend/.env.example chat2excel-frontend/.env.local
   # 编辑 .env.local，配置 VITE_DOC2X_PROXY_URL
   ```

4. **启动服务**
   ```bash
   # 终端 1: 启动后端
   npm run dev:server

   # 终端 2: 启动前端
   cd chat2excel-frontend
   npm run dev
   ```

## 密钥获取

访问 https://doc2x.noedgeai.com/ 注册账号并获取 API 密钥。

## 故障排查

### 问题 1: 后端启动失败，提示 "DOC2X_API_KEY 环境变量未设置"
**解决方案**: 检查根目录是否存在 `.env` 文件，且包含有效的 `DOC2X_API_KEY`

### 问题 2: 前端无法连接后端
**解决方案**:
1. 确认后端服务是否运行（http://localhost:3001/api/health）
2. 检查前端的 `VITE_DOC2X_PROXY_URL` 配置
3. 确认端口 3001 未被占用

### 问题 3: API 调用失败
**解决方案**:
1. 验证 API 密钥是否有效
2. 检查 Doc2X 服务是否正常
3. 查看后端日志获取详细错误信息

## 修改记录

- 2026-01-06: 创建环境变量配置文档
- 2026-01-06: 修复硬编码 API 密钥安全问题
- 2026-01-06: 清理重复的环境变量配置
