---
title: 数据库、MySQL 与 Prisma
status: unread
direction: technical-development
---

# 数据库、MySQL 与 Prisma

## 关系型数据库

数据库保存结构化数据，表由行和列组成。主键唯一标识一行，外键表达表之间的关系。常见关系包括一对一、一对多和多对多。

```sql
CREATE TABLE todo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT id, title FROM todo WHERE completed = FALSE ORDER BY created_at DESC;
```

写入数据时使用参数化查询，避免把用户输入拼接进 SQL。索引应服务于真实查询，过多索引会增加写入成本。

## Prisma

Prisma 用 schema 描述数据模型，并生成类型安全的客户端：

```prisma
model Todo {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

典型流程：配置 `DATABASE_URL` → 编写 schema → 创建迁移 → 生成客户端 → 在服务层调用客户端。迁移文件应提交到 Git，生产环境不要随意重置数据库。

## 练习

- [ ] 为“用户—待办”设计表结构，并说明主键和外键。
- [ ] 写出查询未完成待办、创建待办和更新状态的 SQL。
- [ ] 用 Prisma schema 表达用户与待办的一对多关系。

## 学习衔接

把数据模型接入[HTTP、API 与爬虫](backend-http-api.md)中的接口，然后用于项目实践；文档型数据可选读[MongoDB 入门](sharing-mongodb.md)。
