# 阿里云 CDN 快速配置指南 - yiruo.chat

## 前提条件

✅ 域名：yiruo.chat
✅ DNS 已指向 Vercel：76.76.21.21
✅ ICP 已备案
✅ Vercel 项目：chat2excel-full

---

## 步骤 1：开通阿里云 CDN

1. **登录阿里云 CDN 控制台**
   - 访问：https://cdn.console.aliyun.com
   - 如果未开通，点击"立即开通"

2. **选择计费方式**
   - 推荐：**按流量计费**（适合初期，成本低）
   - 备选：按带宽计费（流量大时更划算）

---

## 步骤 2：添加 CDN 加速域名

1. **在 CDN 控制台，点击"添加域名"**

2. **填写域名配置**

```
加速域名：yiruo.chat
业务类型：图片小文件
加速区域：中国大陆
```

3. **配置源站信息**

```
源站类型：域名
源站地址：chat2excel-full.vercel.app
端口：80
```

**重要说明**：
- 源站地址使用 Vercel 的原始域名
- 不要使用 `yiruo.chat` 作为源站（会导致循环）

4. **点击"确定"提交**

---

## 步骤 3：配置 CNAME

添加域名后，阿里云会分配一个 CNAME 记录，例如：
```
yiruo.chat.w.kunlunle.com
```

### 修改 DNS 配置

1. **返回阿里云 DNS 控制台**
   - 访问：https://dns.console.aliyun.com
   - 找到域名 `yiruo.chat`

2. **删除或禁用现有的 A 记录**

   删除这两条记录：
   ```
   A  @  76.76.21.21
   A  www  76.76.21.21
   ```

3. **添加 CNAME 记录**

   **记录 1**（根域名）：
   ```
   记录类型：CNAME
   主机记录：@
   记录值：yiruo.chat.w.kunlunle.com（使用实际分配的 CNAME）
   TTL：10 分钟
   ```

   **记录 2**（www 子域名）：
   ```
   记录类型：CNAME
   主机记录：www
   记录值：yiruo.chat.w.kunlunle.com（使用实际分配的 CNAME）
   TTL：10 分钟
   ```

---

## 步骤 4：配置 HTTPS（SSL 证书）

1. **在 CDN 控制台，找到域名 yiruo.chat**
2. **点击"HTTPS 设置"**
3. **开启 HTTPS**

### 证书配置

**选项 A：使用免费证书（推荐）**
1. 选择"免费证书"
2. 点击"申请证书"
3. 等待证书签发（通常 5-10 分钟）

**选项 B：使用已有证书**
如果你有自己的证书，可以上传证书文件

### 强制 HTTPS 跳转

开启以下选项：
- ✅ **强制 HTTPS 跳转**：自动将 HTTP 请求跳转到 HTTPS
- ✅ **HTTP2**：提升性能
- ✅ **QUIC**（可选）：进一步提升性能

---

## 步骤 5：配置缓存策略

1. **在 CDN 控制台，点击域名 yiruo.chat**
2. **进入"性能优化" → "缓存配置"**

### 推荐缓存规则

| 目录/文件类型 | 缓存时间 | 优先级 | 说明 |
|-------------|---------|--------|------|
| `/api/*` | 0 秒（不缓存） | 高 | API 请求不缓存 |
| `/*.html` | 0 秒（不缓存） | 高 | HTML 不缓存 |
| `/assets/*` | 31536000 秒（1年） | 中 | 静态资源长期缓存 |
| `/*.js` | 31536000 秒（1年） | 中 | JS 文件长期缓存 |
| `/*.css` | 31536000 秒（1年） | 中 | CSS 文件长期缓存 |
| `/*.png` | 31536000 秒（1年） | 中 | 图片长期缓存 |
| `/*.jpg` | 31536000 秒（1年） | 中 | 图片长期缓存 |

### 配置参数过滤

在"参数过滤"中：
- ✅ **全路径缓存**：关闭
- ✅ **忽略参数**：开启（对静态资源）

---

## 步骤 6：配置回源 Host

1. **在 CDN 控制台，点击域名 yiruo.chat**
2. **进入"回源配置" → "回源 HOST"**

```
回源 HOST：chat2excel-full.vercel.app
```

**原因**：确保回源到 Vercel 时携带正确的 Host 头。

---

## 步骤 7：验证 CDN 配置

### 1. 检查 DNS 解析

```bash
bash scripts/check-dns.sh
```

**预期结果**：应该显示 CNAME 记录而不是 A 记录

### 2. 检查 CDN 缓存

```bash
curl -I https://yiruo.chat
```

**预期响应头**：
```
Via: cacheXX.l2cmXXX[...], cacheXX.l2cmXXX[...]
X-Cache: HIT from CDN
```

### 3. 测试网站访问

访问以下 URL 测试：
- https://yiruo.chat
- https://www.yiruo.chat

---

## 步骤 8：监控 CDN 性能

### 在 CDN 控制台查看

1. **流量监控**：实时查看流量使用情况
2. **命中率**：目标 90%+ 命中率
3. **回源率**：目标 <10% 回源率
4. **状态码**：监控 4xx/5xx 错误

### 设置告警

建议设置以下告警：
- 流量超过阈值（如 100GB/天）
- 2xx/4xx/5xx 状态码比例异常
- 回源率过高

---

## 成本估算

### 按流量计费（参考价格）

**中国大陆流量**：¥0.24/GB

| 日活 | 人均流量/天 | 月流量 | 月费用 |
|------|-----------|--------|--------|
| 1 千 | 50MB | 1.5TB | ¥360 |
| 1 万 | 50MB | 15TB | ¥3,600 |
| 10 万 | 50MB | 150TB | ¥36,000 |

### 省钱方案

1. **购买流量包**：比按量付费便宜约 20%
   - 1TB 流量包：约 ¥200（原价 ¥240）
   - 10TB 流量包：约 ¥1,800（原价 ¥2,400）

2. **设置费用预警**
   - 在费用中心设置预算告警
   - 避免意外产生高额费用

---

## 故障排查

### 问题 1：CDN 不生效

**检查**：
1. DNS 是否已改为 CNAME
2. 等待 DNS 生效（5-10 分钟）
3. 清除浏览器缓存

**解决**：
```bash
# 清除本地 DNS 缓存
sudo dscacheutil -flushcache  # macOS
ipconfig /flushdns            # Windows

# 验证 DNS
dig +short CNAME yiruo.chat
```

### 问题 2：HTTPS 证书不生效

**检查**：
1. 证书是否已签发（在 CDN 控制台查看）
2. HTTPS 是否已开启
3. 强制跳转是否已配置

**解决**：
- 等待证书签发（5-10 分钟）
- 检查证书状态
- 重新申请证书

### 问题 3：API 请求被缓存

**症状**：上传文件或查询状态时，返回旧数据

**解决**：
1. 在缓存配置中排除 `/api/*` 路径
2. 检查 API 响应头是否包含 `Cache-Control: no-store`
3. 清除 CDN 缓存（在控制台操作）

---

## 性能优化建议

### 1. 开启 Gzip 压缩

在 CDN 控制台 → 性能优化：
```
✅ 启用 Gzip 压缩
✅ 压缩类型：text/plain, text/html, application/json, etc.
```

**效果**：文件大小减少 60-80%

### 2. 开启 HTTP/2 和 HTTP/3

在 CDN 控制台 → HTTPS 设置：
```
✅ HTTP/2：开启
✅ HTTP/3 (QUIC)：开启（可选）
```

**效果**：多路复用，减少延迟

### 3. 预加载热点资源

在 HTML 中添加：
```html
<link rel="dns-prefetch" href="https://yiruo.chat">
<link rel="preconnect" href="https://yiruo.chat">
```

---

## 配置完成清单

- [ ] 开通阿里云 CDN
- [ ] 添加加速域名 yiruo.chat
- [ ] 配置源站地址为 chat2excel-full.vercel.app
- [ ] 修改 DNS 为 CNAME 记录
- [ ] 开启 HTTPS 并配置证书
- [ ] 配置缓存策略
- [ ] 配置回源 Host
- [ ] 验证 CDN 加速生效
- [ ] 设置监控告警

---

## 下一步

配置完成后：

1. **测试网站功能**
   - 访问 https://yiruo.chat
   - 测试文件上传功能
   - 验证 OCR 识别功能

2. **监控 CDN 性能**
   - 查看命中率（目标 90%+）
   - 监控流量使用
   - 观察访问速度提升

3. **优化配置**（根据实际使用情况）
   - 调整缓存时间
   - 优化缓存规则
   - 购买流量包节省成本

---

## 参考文档

- [阿里云 CDN 产品文档](https://help.aliyun.com/product/27105.html)
- [CDN 快速入门](https://help.aliyun.com/document_detail/27109.html)
- [缓存配置说明](https://help.aliyun.com/document_detail/27130.html)
- [Vercel 自定义域名](https://vercel.com/docs/concepts/projects/domains)

---

## 需要帮助？

配置完成后，告诉我结果，我会帮你：
1. 验证 CDN 加速是否生效
2. 检查缓存命中率
3. 优化性能配置
4. 估算成本并提供建议
