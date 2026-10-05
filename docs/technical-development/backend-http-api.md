---
title: HTTP、API 与爬虫
status: unread
direction: technical-development
---

# HTTP、API 与爬虫

## HTTP 基础

浏览器访问网页时，先向服务器发送 HTTP 请求。请求包含方法、URL、请求头和可选的请求体；服务器返回状态码、响应头和响应体。

常见方法：

- `GET` 获取资源。
- `POST` 创建资源或提交操作。
- `PUT` / `PATCH` 更新资源。
- `DELETE` 删除资源。

常见状态码：`200` 成功、`201` 创建、`400` 请求错误、`401` 未认证、`403` 无权限、`404` 不存在、`500` 服务端错误。

## API 设计

API 是前端和后端之间的约定。以待办事项为例：

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| `GET` | `/api/todos` | 获取列表 |
| `POST` | `/api/todos` | 创建一项 |
| `PATCH` | `/api/todos/:id` | 更新状态 |
| `DELETE` | `/api/todos/:id` | 删除一项 |

统一返回 JSON，明确错误结构，校验输入，并在接口文档中写出认证方式、参数和示例。

## 爬虫的基本流程

1. 请求允许访问的公开页面或接口。
2. 检查响应状态与内容类型。
3. 解析 HTML、JSON 或分页数据。
4. 清洗、去重并保存结果。

开发前应查看网站条款和 `robots.txt`，控制请求频率，不绕过登录、验证码或访问控制，不收集与任务无关的个人信息。

```ts
const response = await fetch('https://example.com/api/items')
if (!response.ok) throw new Error(`HTTP ${response.status}`)
const data = await response.json()
```

## 练习

- [ ] 为一个待办应用设计 4 个 REST API，并写出请求和响应示例。
- [ ] 用 `fetch` 调用一个公开接口，处理超时、非 2xx 状态和空数据。
- [ ] 解释为什么爬虫需要限速和遵守网站规则。

## 学习衔接

继续学习[数据库、MySQL 与 Prisma](backend-database-mysql-prisma.md)，并与[前端 DOM 与框架](frontend-javascript-dom.md)约定 JSON 和错误状态；上线后的问题反馈参考[产品推广、反馈与增长](../product-operations/product-feedback-growth.md)。
