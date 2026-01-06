# 日志迁移指南

## 概述

本文档说明如何将代码中的 `console.log` 替换为统一的日志工具 `logger`。

## 迁移步骤

### 1. 导入日志工具

```typescript
// 之前
import { useState } from 'react';

// 之后
import { useState } from 'react';
import { logger } from '@/lib/logger';
// 或者使用带上下文的日志器
import { createLogger } from '@/lib/logger';

const log = createLogger('ComponentName');
```

### 2. 替换 console.log

#### 调试日志

```typescript
// 之前
console.log('文件上传:', file);

// 之后
logger.debug('文件上传:', file);
// 或使用带上下文的日志器
log.debug('文件上传:', file);
```

#### 信息日志

```typescript
// 之前
console.log('用户登录成功');

// 之后
logger.info('用户登录成功');
```

#### 警告日志

```typescript
// 之前
console.warn('未找到文件');

// 之后
logger.warn('未找到文件');
```

#### 错误日志

```typescript
// 之前
console.error('请求失败:', error);

// 之后
logger.error('请求失败', error);
```

### 3. 完整示例

#### 修改前 (Home.tsx)

```typescript
export default function Home() {
  const handleStartRecognition = () => {
    console.log('🔵 点击了开始识别按钮');
    console.log('📁 当前上传的文件数量:', uploadedFiles.length);
    console.log('📄 文件详情:', uploadedFiles);

    if (uploadedFiles.length === 0) {
      console.warn('⚠️ 没有已上传的文件');
      return;
    }

    setUploadedFilesToStore(uploadedFiles);
    console.log('✅ 已保存文件到 store，数量:', uploadedFiles.length);
    console.log('🚀 准备跳转到 /recognizing');

    navigate('/recognizing');
  };
}
```

#### 修改后 (Home.tsx)

```typescript
import { createLogger } from '@/lib/logger';

const log = createLogger('Home');

export default function Home() {
  const handleStartRecognition = () => {
    log.debug('点击了开始识别按钮');
    log.debug('当前上传的文件数量:', uploadedFiles.length);

    if (uploadedFiles.length === 0) {
      log.warn('没有已上传的文件');
      return;
    }

    setUploadedFilesToStore(uploadedFiles);
    log.info('已保存文件到 store，数量:', uploadedFiles.length);
    log.info('准备跳转到 /recognizing');

    navigate('/recognizing');
  };
}
```

## 日志级别说明

| 级别 | 用途 | 示例 | 开发环境 | 生产环境 |
|------|------|------|----------|----------|
| DEBUG | 详细的调试信息 | 函数参数、中间状态 | ✅ 显示 | ❌ 不显示 |
| INFO | 一般信息 | 用户操作、状态变化 | ✅ 显示 | ❌ 不显示 |
| WARN | 警告信息 | 非致命错误、潜在问题 | ✅ 显示 | ❌ 不显示 |
| ERROR | 错误信息 | 异常、失败操作 | ✅ 显示 | ✅ 显示 |
| NONE | 禁用所有日志 | - | - | - |

## 生产环境配置

```typescript
// main.tsx 或应用入口
import { logger, LogLevel } from '@/lib/logger';

// 生产环境配置
if (!import.meta.env.DEV) {
  logger.setConfig({
    level: LogLevel.ERROR, // 只显示错误
    enableTimestamp: true,
    enableColors: false,   // 生产环境不需要颜色
    onError: (message, error) => {
      // 上报错误到监控服务
      sendToErrorTracking(message, error);
    },
  });
}
```

## 最佳实践

### ✅ 推荐做法

1. **使用适当的日志级别**
   ```typescript
   log.debug('变量值:', value);        // 调试信息
   log.info('用户操作:', action);       // 重要操作
   log.warn('配置项缺失，使用默认值'); // 警告
   log.error('请求失败', error);        // 错误
   ```

2. **使用带上下文的日志器**
   ```typescript
   const log = createLogger('HomePage');
   // 输出: [HomePage] 用户点击了按钮
   ```

3. **错误日志包含 Error 对象**
   ```typescript
   try {
     await doSomething();
   } catch (error) {
     log.error('操作失败', error); // 传递 error 对象
   }
   ```

### ❌ 不推荐做法

1. **不要在生产环境输出敏感信息**
   ```typescript
   // ❌ 错误
   log.debug('用户密码:', password);

   // ✅ 正确
   log.debug('用户登录');
   ```

2. **不要在循环中使用大量日志**
   ```typescript
   // ❌ 错误
   for (let i = 0; i < 10000; i++) {
     log.debug('处理第', i, '个项目');  // 性能问题
   }

   // ✅ 正确
   log.debug('开始处理 10000 个项目');
   for (let i = 0; i < 10000; i++) {
     // 处理逻辑
   }
   log.debug('处理完成');
   ```

3. **不要保留表情符号（emoji）**
   ```typescript
   // ❌ 错误
   console.log('✅ 操作成功');

   // ✅ 正确
   log.info('操作成功');
   ```

## 批量替换脚本

如果你想快速替换代码中的 console.log，可以使用以下脚本：

```bash
# 替换 console.log
find ./src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/console\.log(/logger.debug(/g'

# 替换 console.warn
find ./src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/console\.warn(/logger.warn(/g'

# 替换 console.error
find ./src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/console\.error(/logger.error(/g'
```

**注意**: 批量替换后，需要手动检查每个文件，确保：
1. 已导入 logger
2. 使用了正确的日志级别
3. 移除了表情符号
4. 错误日志的参数格式正确

## 迁移检查清单

- [ ] 在应用入口配置 logger
- [ ] 替换所有 console.log
- [ ] 替换所有 console.warn
- [ ] 替换所有 console.error
- [ ] 移除调试用的表情符号
- [ ] 测试生产环境日志级别
- [ ] 配置错误上报（可选）
- [ ] 更新相关文档

## 预期效果

### 性能提升

- **开发环境**: 日志更清晰，易于调试
- **生产环境**: 减少 console 开销，提升性能
- **日志管理**: 统一管理，易于配置

### 代码质量

- **可维护性**: 日志格式统一
- **可测试性**: 可以轻松 mock logger
- **可扩展性**: 易于添加日志上报、过滤等功能

## 总结

使用统一的日志工具可以：
- ✅ 提升代码质量和可维护性
- ✅ 改善生产环境性能
- ✅ 便于错误追踪和调试
- ✅ 支持灵活的日志配置

建议逐步迁移，优先处理以下文件：
1. 核心业务逻辑
2. 错误处理代码
3. 用户操作日志
4. 调试信息

---

文档更新日期: 2026-01-06
