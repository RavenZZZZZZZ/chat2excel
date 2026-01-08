# Vercel + 阿里云 CDN 配置指南

## 概述

本指南介绍如何使用阿里云 CDN 加速 Vercel 应用，提升中国大陆用户的访问速度。

## 架构说明

```
用户（中国大陆）
    ↓
阿里云 CDN（国内节点）
    ↓
Vercel（源站）
    ↓
Doc2X API（OCR服务）
```

## 前置要求

- ✅ 已有 Vercel 部署的应用
- ⚠️ 需要购买域名
- ⚠️ 域名需要 ICP 备案（必需）

---

## 步骤一：购买域名并备案

### 1. 购买域名
推荐域名注册商：
- 阿里云（万网）
- 腾讯云（ dnspod）
- Cloudflare（国际）

### 2. ICP 备案
**备案时间**：7-20 个工作日

**备案所需材料**：
- 企业：营业执照、法人身份证
- 个人：身份证

**备案流程**：
1. 登录阿里云/腾讯云控制台
2. 进入 ICP 备案系统
3. 填写网站信息
4. 上传材料
5. 等待审核

---

## 步骤二：配置自定义域名到 Vercel

### 1. 在 Vercel 添加自定义域名

```bash
# 方式 1: 通过 Vercel CLI
vercel domains add your-domain.com

# 方式 2: 通过 Vercel Dashboard
# Settings → Domains → Add Domain
```

### 2. 配置 DNS 记录

在你的域名 DNS 管理处添加：

```
类型    主机记录    记录值
A       @          76.76.21.21
A       www        76.76.21.21
```

**注意**：`76.76.21.21` 是 Vercel 的负载均衡器 IP

### 3. 等待 SSL 证书生成

Vercel 会自动为你的域名生成 Let's Encrypt SSL 证书。

---

## 步骤三：配置阿里云 CDN

### 1. 开通阿里云 CDN

1. 登录 [阿里云 CDN 控制台](https://cdn.console.aliyun.com)
2. 点击"开通 CDN"
3. 选择"按流量计费"或"按带宽计费"

**费用参考**（按流量计费）：
- 中国大陆流量：¥0.24/GB
- 假设 10 万日活，人均使用 100MB，月费用约 ¥720

### 2. 添加 CDN 域名

在 CDN 控制台：
1. 点击"添加域名"
2. 填写配置：

```
加速域名：your-domain.com
业务类型：图片小文件
源站类型：域名
源站地址：your-vercel-app.vercel.app
端口：80
加速区域：中国大陆
```

### 3. 配置 CNAME

添加域名后，阿里云会分配一个 CNAME 记录，例如：

```
your-domain.com.w.kunlunle.com
```

**在你的域名 DNS 处修改**：

```
类型    主机记录    记录值
CNAME   @          your-domain.com.w.kunlunle.com
CNAME   www        your-domain.com.w.kunlunle.com
```

### 4. 配置缓存策略

在 CDN 控制台 → 域名管理 → 性能优化：

**推荐配置**：

| 文件类型 | 缓存时间 | 说明 |
|---------|---------|------|
| 静态资源（js/css/png/jpg） | 31536000 秒（1年） | 带文件名哈希，长期缓存 |
| HTML 文件 | 0 秒（不缓存） | 频繁更新，不缓存 |
| API 响应 | 0 秒（不缓存） | 动态内容，不缓存 |

**缓存键配置**：
- 关闭"全路径缓存"
- 开启"忽略参数缓存"（针对静态资源）

---

## 步骤四：配置 HTTPS

### 1. 在阿里云 CDN 配置 SSL

1. CDN 控制台 → 域名管理 → HTTPS 设置
2. 开启 HTTPS
3. 选择证书类型：
   - **免费版**：阿里云免费 SSL 证书（3 个月有效期，需续签）
   - **付费版**：正式证书（1 年有效期）

### 2. 强制 HTTPS

开启"强制 HTTPS 跳转"，所有 HTTP 请求自动跳转到 HTTPS。

---

## 步骤五：配置回源 Host

### 1. 设置回源 Host

在 CDN 控制台 → 域名管理 → 回源配置：

```
回源 Host：your-vercel-app.vercel.app
```

**原因**：确保回源到 Vercel 时携带正确的 Host 头。

---

## 步骤六：验证配置

### 1. 检查 DNS 解析

```bash
# 检查域名是否解析到 CDN
ping your-domain.com

# 应该返回 CDN 节点 IP，而不是 Vercel IP
```

### 2. 检查 CDN 缓存

```bash
# 查看响应头
curl -I https://your-domain.com

# 应该看到：
# Via: cacheXX.l2cmXXX[...], cacheXX.l2cmXXX[...]
# X-Cache: HIT from CDN
```

### 3. 测试访问速度

```bash
# 使用 WebPageTest 测试
# https://www.webpagetest.org

# 预期结果：
# - 国内访问速度：1-3 秒
# - 国际访问速度：2-5 秒
```

---

## 成本估算

### 场景一：日活 1 万
假设：
- 人均访问 10 次/天
- 人均流量 50MB/天
- 月流量：1 万 × 50MB × 30 天 = 15TB

**月费用**：15TB × ¥0.24 = **¥3,600**

### 场景二：日活 10 万
假设：
- 人均流量 50MB/天
- 月流量：10 万 × 50MB × 30 天 = 150TB

**月费用**：150TB × ¥0.24 = **¥36,000**

**省钱方案**：
- 购买 CDN 流量包（更便宜）
- 考虑按带宽计费（高流量场景）

---

## 故障排查

### 问题 1：CDN 节点不生效

**检查**：
```bash
# 查看本地 DNS 缓存
ipconfig /flushdns  # Windows
sudo dscacheutil -flushcache  # macOS

# 查看域名解析
nslookup your-domain.com
```

**解决**：
- 等待 DNS 生效（最长 48 小时）
- 检查 CNAME 配置是否正确

### 问题 2：HTTPS 证书不生效

**检查**：
```bash
# 查看 SSL 证书
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

**解决**：
- 确认 CDN 证书已配置
- 等待证书下发（通常 5-10 分钟）

### 问题 3：API 请求被缓存

**解决**：
- 在 CDN 控制台排除 `/api/*` 路径
- 设置 API 响应头：`Cache-Control: no-store`

---

## 监控和分析

### 阿里云 CDN 监控

- **流量监控**：查看实时流量使用情况
- **命中率**：目标 90%+ 命中率
- **回源率**：目标 <10% 回源率
- **状态码**：监控 4xx/5xx 错误

### 日志分析

1. 开启 CDN 访问日志
2. 使用日志服务（SLS）分析
3. 关注关键指标：
   - PV/UV
   - 热门资源
   - 访问来源

---

## 性能优化建议

### 1. 启用 Gzip 压缩

在 CDN 控制台 → 性能优化 → 压缩：

```
✅ 启用 Gzip 压缩
✅ 压缩类型：text/plain, text/html, application/json, etc.
```

### 2. 预加载热点资源

在应用代码中添加：

```html
<link rel="dns-prefetch" href="https://your-domain.com">
<link rel="preconnect" href="https://your-domain.com">
```

### 3. 使用 HTTP/2 或 HTTP/3

在 CDN 控制台开启：

```
✅ 启用 HTTP/2
✅ 启用 HTTP/3（QUIC）
```

### 4. 优化图片资源

- 使用 WebP 格式
- 开启图片自动裁剪
- 使用懒加载

---

## 参考文档

- [阿里云 CDN 文档](https://help.aliyun.com/product/27105.html)
- [Vercel 自定义域名](https://vercel.com/docs/concepts/projects/domains)
- [ICP 备案指南](https://beian.aliyun.com)

---

## 注意事项

⚠️ **ICP 备案是必需的**
- 未备案的域名无法使用国内 CDN
- 备案需要 7-20 个工作日
- 个人和企业都可以备案

⚠️ **成本控制**
- 监控流量使用情况
- 设置费用告警
- 购买流量包更优惠

⚠️ **合规要求**
- 网站底部添加备案号
- 添加公安备案（如需要）
- 遵守中国法律法规

---

## 下一步

配置完成后，你可以：
1. 监控 CDN 性能指标
2. 优化缓存策略
3. 考虑添加多地区 CDN（国际加速）
4. 评估迁移到阿里云全托管架构（10 万+ 日活）

需要帮助配置？查看：
- [阿里云 CDN 帮助中心](https://help.aliyun.com/product/27105.html)
- [Vercel 部署文档](./VERCEL_DEPLOYMENT.md)
